import {Component, computed, inject, signal} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {catchError, forkJoin, map, of, startWith, switchMap} from 'rxjs';
import {DatePipe, DecimalPipe, LowerCasePipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {BaseChartDirective} from 'ng2-charts';
import {ChartConfiguration} from 'chart.js';
import {downloadSessionReadingsCsv} from './session-readings-csv';
import {ProcessReading} from '../../../domain/model/process-reading.entity';
import {SpraySession} from '../../../domain/model/spray-session.entity';
import {ProcessMonitoringApi} from '../../../infrastructure/process-monitoring-api';
import {EquipmentStore} from '../../../../equipment/application/equipment.store';
import {TraceabilityStore} from '../../../../traceability/application/traceability.store';
import {FaultDiagnosisApi} from '../../../../fault-diagnosis/infrastructure/fault-diagnosis-api';
import {FaultCase} from '../../../../fault-diagnosis/domain/model/fault-case.entity';
import {complianceOf, durationMinutes, groupByParameter, normalize, statisticsOf} from '../../../domain/model/reading-series';
import {BASE_CHART_OPTIONS, CHART_COLORS} from '../../../../shared/presentation/chart-theme';
import {GenerateReportDialog} from '../../../../reporting/presentation/components/generate-report-dialog/generate-report-dialog';
import {ParameterTrendChart} from '../../components/parameter-trend-chart/parameter-trend-chart';

type AnalysisState =
  | {status: 'loading' | 'error'}
  | {status: 'ready'; session: SpraySession; readings: ProcessReading[]; faultCases: FaultCase[]};

/**
 * Post-session analysis: KPIs, statistics per parameter against the recipe bands, normalized deviation chart,
 * out-of-band readings and fault cases, plus CSV and PDF exports.
 */
@Component({
  selector: 'app-spray-session-report',
  imports: [DatePipe, DecimalPipe, LowerCasePipe, MatButtonModule, MatIconModule, MatTabsModule, RouterLink, TranslatePipe, BaseChartDirective, ParameterTrendChart],
  templateUrl: './spray-session-report.html',
  styleUrl: './spray-session-report.css'
})
export class SpraySessionReport {
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #api = inject(ProcessMonitoringApi);
  readonly #faultsApi = inject(FaultDiagnosisApi);
  readonly #dialog = inject(MatDialog);
  readonly #translate = inject(TranslateService);
  readonly equipment = inject(EquipmentStore);
  readonly traceability = inject(TraceabilityStore);

  readonly state = toSignal(this.#route.paramMap.pipe(switchMap(params => {
    const sessionId = Number(params.get('id'));
    if (!Number.isSafeInteger(sessionId) || sessionId < 1) return of<AnalysisState>({status: 'error'});
    return forkJoin({
      session: this.#api.getSession(sessionId),
      readings: this.#api.getReadingsBySessionId(sessionId),
      faultCases: this.#faultsApi.getFaultCasesBySessionId(sessionId).pipe(catchError(() => of([] as FaultCase[])))
    }).pipe(
      map(({session, readings, faultCases}): AnalysisState => ({status: 'ready', session, readings, faultCases})),
      catchError(() => of<AnalysisState>({status: 'error'})),
      startWith<AnalysisState>({status: 'loading'})
    );
  })), {initialValue: {status: 'loading'} as AnalysisState});

  readonly ready = computed(() => { const s = this.state(); return s.status === 'ready' ? s : null; });
  readonly session = computed(() => this.ready()?.session);
  readonly readings = computed(() => this.ready()?.readings ?? []);
  readonly faultCases = computed(() => this.ready()?.faultCases ?? []);
  readonly system = computed(() => this.session() ? this.equipment.getHvofSystemById(this.session()!.hvofSystemId)() : undefined);
  readonly recuperation = computed(() => this.session() ? this.traceability.getRecuperationById(this.session()!.recuperationId)() : undefined);
  readonly recipe = computed(() => this.session() ? this.equipment.recipeByNumber(this.session()!.hvofSystemId, this.session()!.recipeNumber)() : undefined);

  readonly byParameter = computed(() => groupByParameter(this.readings()));
  readonly parameters = computed(() => [...this.byParameter().keys()]);
  readonly compliance = computed(() => complianceOf(this.readings()));
  readonly duration = computed(() => this.session() ? durationMinutes(this.session()!.startedAt, this.session()!.endedAt) : 0);
  readonly deviations = computed(() => this.readings().filter(r => r.band === 'warning' || r.band === 'shutdown'));
  readonly bandCounts = computed(() => {
    const counts = {nominal: 0, out_of_nominal: 0, warning: 0, shutdown: 0};
    for (const r of this.readings()) counts[r.band]++;
    return counts;
  });

  /** One row per parameter: statistics, nominal band and share of readings in each band. */
  readonly statistics = computed(() => this.parameters().map(parameter => {
    const list = this.byParameter().get(parameter)!;
    const stats = statisticsOf(list);
    const p = this.recipe()?.parameterFor(parameter);
    const outOfBand = list.filter(r => r.band !== 'nominal').length;
    const worst = list.reduce((acc, r) => Math.max(acc, Math.abs(normalize(r.value, p))), 0);
    return {parameter, unit: p?.unitSymbol ?? list[0]?.unitSymbol ?? '', stats, recipe: p, outOfBand, compliance: complianceOf(list), worst};
  }));

  readonly selectedParameter = signal<string | null>(null);
  readonly trendParameter = computed(() => this.selectedParameter() ?? this.parameters()[0] ?? null);
  readonly trendRecipeParameter = computed(() => this.trendParameter() ? this.recipe()?.parameterFor(this.trendParameter()!) : undefined);

  /** Normalized deviation of every parameter on one chart: 0 = setpoint, ±1 = shutdown limits. */
  readonly normalizedData = computed<ChartConfiguration<'line'>['data']>(() => {
    const recipe = this.recipe();
    const all = this.readings();
    if (all.length === 0) return {labels: [], datasets: []};
    const start = all[0].epochMillis;
    const end = all[all.length - 1].epochMillis;
    const buckets = 40;
    const step = Math.max(1, (end - start) / buckets);
    const labels = Array.from({length: buckets + 1}, (_, i) => new Date(start + i * step).toLocaleTimeString('es-PE', {hour: '2-digit', minute: '2-digit', second: '2-digit'}));
    const datasets = this.parameters().map((parameter, index) => {
      const p = recipe?.parameterFor(parameter);
      const list = this.byParameter().get(parameter)!;
      const points: (number | null)[] = Array.from({length: buckets + 1}, () => null);
      for (const r of list) {
        const i = Math.min(buckets, Math.floor((r.epochMillis - start) / step));
        const v = normalize(r.value, p);
        points[i] = points[i] === null ? v : (Math.abs(v) > Math.abs(points[i]!) ? v : points[i]);
      }
      const color = CHART_COLORS.series[index % CHART_COLORS.series.length];
      return {label: this.#translate.instant('parameter.' + parameter), data: points, borderColor: color, backgroundColor: color, borderWidth: 2, pointRadius: 2, spanGaps: true, tension: .2};
    });
    return {labels, datasets};
  });

  readonly normalizedOptions: ChartConfiguration<'line'>['options'] = {
    ...BASE_CHART_OPTIONS,
    plugins: {...BASE_CHART_OPTIONS.plugins, legend: {position: 'bottom', labels: {font: {family: 'Poppins'}, boxWidth: 12}}},
    scales: {
      x: {...BASE_CHART_OPTIONS.scales?.['x'], ticks: {...(BASE_CHART_OPTIONS.scales?.['x'] as {ticks?: object})?.ticks, maxTicksLimit: 8}},
      y: {...BASE_CHART_OPTIONS.scales?.['y'], suggestedMin: -1.2, suggestedMax: 1.2, title: {display: true, text: '0 = setpoint · ±1 = shutdown', font: {family: 'Poppins', size: 11}}}
    }
  } as ChartConfiguration<'line'>['options'];

  exportCsv(): void {
    const s = this.session();
    if (s) downloadSessionReadingsCsv(s.id, this.readings());
  }

  generatePdf(): void {
    const s = this.session();
    if (s) this.#dialog.open(GenerateReportDialog, {data: {sessionId: s.id}, width: '480px'});
  }

  openSession(): void {
    const s = this.session();
    if (s) this.#router.navigate(['process-monitoring/spray-sessions', s.id]).then();
  }

  faultCasesOf(): void {
    const s = this.session();
    if (s) this.#router.navigate(['fault-diagnosis/fault-cases'], {queryParams: {spraySessionId: s.id}}).then();
  }
}
