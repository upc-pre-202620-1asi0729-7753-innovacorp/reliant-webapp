import {Component, computed, effect, inject, OnDestroy, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {DatePipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatIconModule} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import {MatTabsModule} from '@angular/material/tabs';
import {MatError} from '@angular/material/form-field';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {ProcessMonitoringStore} from '../../../application/process-monitoring.store';
import {EquipmentStore} from '../../../../equipment/application/equipment.store';
import {TraceabilityStore} from '../../../../traceability/application/traceability.store';
import {ParameterCard} from '../../components/parameter-card/parameter-card';
import {ParameterTrendChart} from '../../components/parameter-trend-chart/parameter-trend-chart';
import {ProcessReading} from '../../../domain/model/process-reading.entity';
import {RecipeParameter} from '../../../../equipment/domain/model/recipe.entity';
import {classify} from '../../../domain/model/band';
import {AbortSessionDialog} from '../../components/abort-session-dialog/abort-session-dialog';
import {GenerateReportDialog} from '../../../../reporting/presentation/components/generate-report-dialog/generate-report-dialog';

/**
 * Live view of a spray session: latest value per parameter, trend charts against the recipe bands,
 * and the controls to finish the session. Readings are simulated from the recipe while no PLC feeds the platform.
 */
@Component({
  selector: 'app-spray-session-detail',
  imports: [MatButtonModule, MatButtonToggleModule, MatIconModule, MatChipsModule, MatTabsModule, MatError, TranslatePipe, DatePipe, ParameterCard, ParameterTrendChart],
  templateUrl: './spray-session-detail.html',
  styleUrl: './spray-session-detail.css'
})
export class SpraySessionDetail implements OnDestroy {
  readonly store = inject(ProcessMonitoringStore);
  readonly equipment = inject(EquipmentStore);
  readonly traceability = inject(TraceabilityStore);
  #route = inject(ActivatedRoute);
  #router = inject(Router);
  #dialog = inject(MatDialog);

  readonly sessionId = toSignal(this.#route.params.pipe(map(p => +p['id'])), {initialValue: 0});
  readonly session = computed(() => this.store.getSessionById(this.sessionId())());
  readonly system = computed(() => this.session() ? this.equipment.getHvofSystemById(this.session()!.hvofSystemId)() : undefined);
  readonly recuperation = computed(() => this.session() ? this.traceability.getRecuperationById(this.session()!.recuperationId)() : undefined);
  readonly recipe = computed(() => {
    const s = this.session();
    return s ? this.equipment.recipeByNumber(s.hvofSystemId, s.recipeNumber)() : undefined;
  });

  readonly cards = computed(() => [...this.store.latestByParameter().values()]);
  readonly selectedParameter = signal<string | null>(null);
  readonly trendParameter = computed(() => this.selectedParameter() ?? this.store.parameters()[0] ?? null);
  readonly trendRecipeParameter = computed(() => {
    const parameter = this.trendParameter();
    return parameter ? this.recipe()?.parameterFor(parameter) : undefined;
  });
  readonly simulating = signal(false);

  constructor() {
    effect(() => {
      const s = this.session();
      if (!s) return;
      if (s.isActive) this.store.startPolling(s.id);
      else this.store.loadReadings(s.id);
    });
  }

  recipeParameterOf(parameter: string) {
    return this.recipe()?.parameterFor(parameter);
  }

  /** One reading of a random recipe parameter, close to its setpoint. */
  simulateReading() {
    const recipe = this.recipe();
    if (!recipe || recipe.parameters.length === 0) return;
    const p = recipe.parameters[Math.floor(Math.random() * recipe.parameters.length)];
    this.#send([this.#reading(p, Date.now(), 0.35)]);
  }

  /** A burst of 3 readings per parameter spread over the last 30 seconds, with a wider drift so some fall out of band. */
  simulateBurst() {
    const recipe = this.recipe();
    if (!recipe || recipe.parameters.length === 0) return;
    const now = Date.now();
    const readings: ProcessReading[] = [];
    recipe.parameters.forEach((p, index) => {
      for (let i = 0; i < 3; i++) {
        const drift = i === 2 && index % 3 === 0 ? 1.1 : 0.5;
        readings.push(this.#reading(p, now - (2 - i) * 10_000 + index * 37, drift));
      }
    });
    this.#send(readings);
  }

  #reading(p: RecipeParameter, epochMillis: number, drift: number): ProcessReading {
    const s = this.session()!;
    const spread = (p.upperShutdown - p.lowerShutdown) * drift;
    const value = Math.round((p.setpoint + (Math.random() - 0.5) * spread) * 10) / 10;
    const subsystem = this.equipment.subsystemOfParameter(s.hvofSystemId, p.parameter);
    return new ProcessReading({
      id: 0,
      spraySessionId: s.id,
      epochMillis,
      plcClockOffsetMillis: 0,
      tagPath: `${this.system()?.code ?? 'HVOF'}/${subsystem?.alias ?? 'SIM'}/${p.parameter}`,
      parameter: p.parameter,
      subsystemId: subsystem?.id ?? null,
      partId: null,
      value,
      unitSymbol: p.unitSymbol,
      unitCategory: p.unitCategory,
      band: classify(value, p),
      derived: false,
      mappingPending: !subsystem
    });
  }

  #send(readings: ProcessReading[]) {
    const s = this.session();
    if (!s) return;
    this.simulating.set(true);
    this.store.addReadings(s.id, readings, () => this.simulating.set(false));
  }

  back() {
    this.#router.navigate(['process-monitoring/spray-sessions']).then();
  }

  analysis() {
    this.#router.navigate(['process-monitoring/spray-sessions', this.sessionId(), 'report']).then();
  }

  generatePdf() {
    this.#dialog.open(GenerateReportDialog, {data: {sessionId: this.sessionId()}, width: '480px'});
  }

  faultCases() {
    this.#router.navigate(['fault-diagnosis/fault-cases'], {queryParams: {spraySessionId: this.sessionId()}}).then();
  }

  ngOnDestroy() {
    this.store.clearReadings();
  }

  complete() {
    const s = this.session();
    if (!s) return;
    this.store.completeSession(s.id);
    this.traceability.refreshRecuperations();
  }

  abort() {
    const s = this.session();
    if (!s) return;
    this.#dialog.open(AbortSessionDialog).afterClosed().subscribe(reason => {
      if (!reason) return;
      this.store.abortSession(s.id, reason);
      this.traceability.refreshRecuperations();
    });
  }
}
