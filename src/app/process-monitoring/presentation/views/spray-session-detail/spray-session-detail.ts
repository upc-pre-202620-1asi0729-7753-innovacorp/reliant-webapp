import {Component, computed, effect, inject, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {DatePipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import {MatError} from '@angular/material/form-field';
import {TranslatePipe} from '@ngx-translate/core';
import {environment} from '../../../../../environments/environment';
import {ProcessMonitoringStore} from '../../../application/process-monitoring.store';
import {EquipmentStore} from '../../../../equipment/application/equipment.store';
import {TraceabilityStore} from '../../../../traceability/application/traceability.store';
import {ParameterCard} from '../../components/parameter-card/parameter-card';
import {ProcessReading} from '../../../domain/model/process-reading.entity';
import {classify} from '../../../domain/model/band';

@Component({
  selector: 'app-spray-session-detail',
  imports: [MatButtonModule, MatIconModule, MatChipsModule, MatError, TranslatePipe, DatePipe, ParameterCard],
  templateUrl: './spray-session-detail.html',
  styleUrl: './spray-session-detail.css'
})
export class SpraySessionDetail implements OnDestroy {
  readonly store = inject(ProcessMonitoringStore);
  readonly equipment = inject(EquipmentStore);
  readonly traceability = inject(TraceabilityStore);
  #route = inject(ActivatedRoute);
  #router = inject(Router);

  readonly isDev = !environment.production;
  readonly sessionId = toSignal(this.#route.params.pipe(map(p => +p['id'])), {initialValue: 0});
  readonly session = computed(() => this.store.getSessionById(this.sessionId())());
  readonly system = computed(() => this.session() ? this.equipment.getHvofSystemById(this.session()!.hvofSystemId)() : undefined);
  readonly recuperation = computed(() => this.session() ? this.traceability.getRecuperationById(this.session()!.recuperationId)() : undefined);
  readonly recipe = computed(() => {
    const s = this.session();
    return s ? this.equipment.recipeByNumber(s.hvofSystemId, s.recipeNumber)() : undefined;
  });
  readonly cards = computed(() => [...this.store.latestByParameter().values()]);

  constructor() {
    effect(() => {
      const s = this.session();
      if (!s) return;
      s.isActive ? this.store.startPolling(s.id) : this.store.loadReadings(s.id);
    });
  }

  recipeParameterOf(parameter: string) {
    return this.recipe()?.parameterFor(parameter);
  }

  simulateReading() {
    const s = this.session();
    const recipe = this.recipe();
    if (!s || !recipe || recipe.parameters.length === 0) return;
    const p = recipe.parameters[Math.floor(Math.random() * recipe.parameters.length)];
    const spread = (p.upperShutdown - p.lowerShutdown) * 0.35;
    const value = Math.round((p.setpoint + (Math.random() - 0.5) * spread) * 10) / 10;
    const mapping = this.system()?.tagMappings.find(m => m.parameter === p.parameter);
    this.store.addReading(new ProcessReading({
      id: 0,
      spraySessionId: s.id,
      epochMillis: Date.now(),
      plcClockOffsetMillis: 0,
      tagPath: mapping?.tagPath ?? p.parameter,
      parameter: p.parameter,
      subsystemId: mapping?.subsystemId ?? null,
      partId: mapping?.partId ?? null,
      value,
      unitSymbol: p.unitSymbol,
      unitCategory: p.unitCategory,
      band: classify(value, p),
      derived: false,
      mappingPending: !mapping
    }));
  }

  back() {
    this.#router.navigate(['process-monitoring/spray-sessions']).then();
  }

  ngOnDestroy() {
    this.store.clearReadings();
  }
}
