import {inject, Injectable} from '@angular/core';
import {forkJoin, map, Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {ProcessMonitoringApi} from '../../process-monitoring/infrastructure/process-monitoring-api';
import {FaultDiagnosisApi} from '../../fault-diagnosis/infrastructure/fault-diagnosis-api';
import {EquipmentStore} from '../../equipment/application/equipment.store';
import {TraceabilityStore} from '../../traceability/application/traceability.store';
import {ProcessMonitoringStore} from '../../process-monitoring/application/process-monitoring.store';
import {IamStore} from '../../iam/application/iam.store';
import {SpraySession} from '../../process-monitoring/domain/model/spray-session.entity';
import {ProcessReading} from '../../process-monitoring/domain/model/process-reading.entity';
import {HvofSystem} from '../../equipment/domain/model/hvof-system.entity';
import {Recipe, RecipeParameter} from '../../equipment/domain/model/recipe.entity';
import {Recuperation} from '../../traceability/domain/model/recuperation.entity';
import {RecoveredComponent} from '../../traceability/domain/model/component.entity';
import {Customer} from '../../traceability/domain/model/customer.entity';
import {FaultCase} from '../../fault-diagnosis/domain/model/fault-case.entity';
import {ReportWidget} from '../domain/model/report-template.entity';
import {complianceOf, durationMinutes, groupByParameter, statisticsOf} from '../../process-monitoring/domain/model/reading-series';

/** Everything a template can draw for one spray session. */
export interface ReportContext {
  session: SpraySession;
  system: HvofSystem | undefined;
  recipe: Recipe | undefined;
  recuperation: Recuperation | undefined;
  component: RecoveredComponent | undefined;
  customer: Customer | undefined;
  readings: ProcessReading[];
  byParameter: Map<string, ProcessReading[]>;
  faultCases: FaultCase[];
  operatorName: string;
}

export interface TrendData { kind: 'trend'; rows: ProcessReading[]; parameter: RecipeParameter | undefined; unit: string; }
export interface TableData { kind: 'table'; rows: (ProcessReading | FaultCase)[]; }
export type ResolvedWidget = string | TrendData | TableData;

/** Gathers, across bounded contexts, the data a report about a spray session is rendered from, and resolves widgets against it. */
@Injectable({providedIn: 'root'})
export class ReportDataService {
  readonly #monitoringApi = inject(ProcessMonitoringApi);
  readonly #faultsApi = inject(FaultDiagnosisApi);
  readonly #monitoring = inject(ProcessMonitoringStore);
  readonly #equipment = inject(EquipmentStore);
  readonly #traceability = inject(TraceabilityStore);
  readonly #iam = inject(IamStore);
  readonly #translate = inject(TranslateService);

  contextOfSession(sessionId: number): Observable<ReportContext> {
    return forkJoin({
      session: this.#monitoringApi.getSession(sessionId),
      readings: this.#monitoringApi.getReadingsBySessionId(sessionId),
      faultCases: this.#faultsApi.getFaultCasesBySessionId(sessionId)
    }).pipe(map(({session, readings, faultCases}) => {
      const recuperation = this.#traceability.getRecuperationById(session.recuperationId)();
      return {
        session,
        system: this.#equipment.getHvofSystemById(session.hvofSystemId)(),
        recipe: this.#equipment.recipeByNumber(session.hvofSystemId, session.recipeNumber)(),
        recuperation,
        component: recuperation ? this.#traceability.getComponentById(recuperation.componentId)() : undefined,
        customer: recuperation ? this.#traceability.getCustomerById(recuperation.customerId)() : undefined,
        readings,
        byParameter: groupByParameter(readings),
        faultCases,
        operatorName: session.operatorId === this.#iam.userId() ? (this.#iam.fullName() ?? '') : `#${session.operatorId}`
      };
    }));
  }

  /** Resolves a widget to a displayable string, or to the rows a trend or table is drawn from. */
  resolve(widget: ReportWidget, context: ReportContext): ResolvedWidget {
    const {session, recuperation, component, customer, system, recipe, readings, byParameter, faultCases} = context;
    const t = (key: string, fallback?: string) => {
      const value = this.#translate.instant(key);
      return value === key && fallback !== undefined ? fallback : value;
    };
    const number = (v: number | null | undefined, digits = 1) => v === null || v === undefined || Number.isNaN(v) ? '–' : Number(v).toLocaleString('es-PE', {maximumFractionDigits: digits});
    const date = (d: string | null) => d ? new Date(d).toLocaleString('es-PE', {dateStyle: 'short', timeStyle: 'short'}) : '–';

    switch (widget.variableSource) {
      case 'process': {
        const list = byParameter.get(widget.variableCode) ?? [];
        const stats = statisticsOf(list);
        const p = recipe?.parameterFor(widget.variableCode);
        const unit = p?.unitSymbol ?? list[0]?.unitSymbol ?? '';
        if (widget.viewType === 'trend') return {kind: 'trend', rows: list, parameter: p, unit};
        if (widget.viewType === 'min_max' || widget.aggregation === 'range') return stats.count ? `${number(stats.min)} – ${number(stats.max)} ${unit}` : '–';
        const value = {avg: stats.mean, min: stats.min, max: stats.max, last: stats.last, count: stats.count, range: null}[widget.aggregation];
        if (!stats.count) return '–';
        return widget.aggregation === 'count' ? number(value, 0) : `${number(value)} ${unit}`.trim();
      }
      case 'session':
        switch (widget.variableCode) {
          case 'system': return system ? `${system.code} · ${system.systemManufacturer} ${system.systemModel}` : `#${session.hvofSystemId}`;
          case 'recipe': return recipe ? `#${recipe.recipeNumber} · ${recipe.name}` : `#${session.recipeNumber}`;
          case 'operator': return context.operatorName;
          case 'started_at': return date(session.startedAt);
          case 'ended_at': return date(session.endedAt);
          case 'duration': return `${durationMinutes(session.startedAt, session.endedAt)} min`;
          case 'status': return t('spray-sessions.status-option.' + session.status);
          case 'readings': return String(readings.length);
          case 'compliance': { const c = complianceOf(readings); return c === null ? '–' : `${number(c)} %`; }
          case 'deviations': {
            const rows = readings.filter(r => r.band === 'warning' || r.band === 'shutdown');
            return widget.viewType === 'table' ? {kind: 'table', rows} : String(rows.length);
          }
          default: return '–';
        }
      case 'recuperation':
        switch (widget.variableCode) {
          case 'work_order_number': return recuperation?.workOrderNumber ?? '–';
          case 'manufacturing_order_number': return recuperation?.manufacturingOrderNumber ?? '–';
          case 'component_serial': return component?.serialNumber ?? '–';
          case 'component_part_number': return component?.partNumber ?? '–';
          case 'machine': return component ? `${component.machineManufacturer} ${component.machineModel}` : '–';
          case 'customer_name': return customer?.legalName ?? '–';
          case 'mine_site': return customer?.mineSite ?? '–';
          case 'operation': return recuperation?.operation ?? '–';
          case 'powder_lot_number': return recuperation?.powderLotNumber ?? '–';
          case 'powder_chemical_composition': return recuperation?.powderChemicalComposition ?? '–';
          default: return '–';
        }
      case 'fault_cases': {
        const rows = widget.variableCode === 'open_cases' ? faultCases.filter(c => c.isOpen) : faultCases;
        return widget.viewType === 'table' ? {kind: 'table', rows} : String(rows.length);
      }
      default: return '–';
    }
  }
}
