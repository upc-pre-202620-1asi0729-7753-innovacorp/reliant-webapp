import {Component, computed, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {DatePipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {IamStore} from '../../../../iam/application/iam.store';
import {ProcessMonitoringStore} from '../../../../process-monitoring/application/process-monitoring.store';
import {TraceabilityStore} from '../../../../traceability/application/traceability.store';
import {EquipmentStore} from '../../../../equipment/application/equipment.store';
import {FaultDiagnosisStore} from '../../../../fault-diagnosis/application/fault-diagnosis.store';
import {DashboardStore} from '../../../application/dashboard.store';
import {ChartWidget} from '../../components/chart-widget/chart-widget';
import {ChartType, DashboardWidgetCode} from '../../../domain/model/dashboard-widget';

/**
 * Operations dashboard of the supplier: live session, open fault cases, recent sessions and two charts.
 * An organization without equipment is sent to the quick start.
 */
@Component({
  selector: 'app-home',
  imports: [RouterLink, DatePipe, MatButtonModule, MatIconModule, TranslatePipe, ChartWidget],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  readonly iam = inject(IamStore);
  readonly monitoring = inject(ProcessMonitoringStore);
  readonly traceability = inject(TraceabilityStore);
  readonly equipment = inject(EquipmentStore);
  readonly faults = inject(FaultDiagnosisStore);
  readonly dashboard = inject(DashboardStore);
  readonly #translate = inject(TranslateService);

  readonly plantIsEmpty = computed(() => this.equipment.loaded() && this.equipment.hvofSystems().length === 0);
  readonly activeSession = computed(() => this.monitoring.activeSessions()[0]);
  readonly recentSessions = computed(() => [...this.monitoring.sessions()].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, 6));
  readonly inProgressRecuperations = computed(() => this.traceability.openRecuperations().length);

  readonly faultLabels = computed(() => [...this.faults.casesByParameter().keys()].map(p => this.#translate.instant('parameter.' + p)));
  readonly faultValues = computed(() => [...this.faults.casesByParameter().values()]);
  readonly statusLabels = computed(() => Object.keys(this.monitoring.sessionsByStatus()).map(s => this.#translate.instant('spray-sessions.status-option.' + s)));
  readonly statusValues = computed(() => Object.values(this.monitoring.sessionsByStatus()));

  setChartType(code: DashboardWidgetCode, type: ChartType): void {
    this.dashboard.setChartType(code, type);
  }

  systemCode(id: number): string {
    return this.equipment.getHvofSystemById(id)()?.code ?? `#${id}`;
  }

  workOrder(id: number): string {
    return this.traceability.getRecuperationById(id)()?.workOrderNumber ?? `#${id}`;
  }

  openCasesOf(sessionId: number): number {
    return this.faults.casesOf(sessionId)().filter(c => c.isOpen).length;
  }
}
