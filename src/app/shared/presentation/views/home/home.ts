import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IamStore } from '../../../../iam/application/iam.store';
import { ProcessMonitoringStore } from '../../../../process-monitoring/application/process-monitoring.store';
import { TraceabilityStore } from '../../../../traceability/application/traceability.store';
import { EquipmentStore } from '../../../../equipment/application/equipment.store';
import { DashboardStore } from '../../../application/dashboard.store';
import { ChartWidget } from '../../components/chart-widget/chart-widget';
import { ChartType } from '../../../domain/model/dashboard-widget';

@Component({
  selector: 'app-home',
  imports: [RouterLink, DatePipe, DecimalPipe, MatButtonModule, TranslatePipe, ChartWidget],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  readonly iam = inject(IamStore);
  readonly monitoring = inject(ProcessMonitoringStore);
  readonly traceability = inject(TraceabilityStore);
  readonly equipment = inject(EquipmentStore);
  readonly dashboard = inject(DashboardStore);
  readonly #translate = inject(TranslateService);

  readonly activeSession = computed(() => this.monitoring.activeSessions()[0]);

  readonly recentSessions = computed(() =>
    [...this.monitoring.sessions()]
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
      .slice(0, 5),
  );

  readonly inProgressRecuperations = computed(
    () =>
      this.traceability
        .recuperations()
        .filter((r) => r.status !== 'DELIVERED' && r.status !== 'CLOSED').length,
  );

  readonly totalDeviations = computed(() =>
    [...this.monitoring.deviationsByParameter().values()].reduce((a, b) => a + b, 0),
  );

  readonly deviationLabels = computed(() =>
    [...this.monitoring.deviationsByParameter().keys()].map((p) =>
      this.#translate.instant('parameter.' + p),
    ),
  );

  readonly deviationValues = computed(() => [...this.monitoring.deviationsByParameter().values()]);

  readonly statusLabels = computed(() =>
    Object.keys(this.monitoring.sessionsByStatus()).map((s) =>
      this.#translate.instant('spray-session.status.' + s),
    ),
  );

  readonly statusValues = computed(() => Object.values(this.monitoring.sessionsByStatus()));

  ngOnInit(): void {
    this.dashboard.load();
    this.monitoring.loadDeviationsByParameter();
  }

  setChartType(code: 'deviationsByParameter' | 'sessionsByStatus', type: ChartType): void {
    this.dashboard.setChartType(code, type);
  }

  componentOf(recuperationId: number): string {
    const recuperation = this.traceability.getRecuperationById(recuperationId)();

    return recuperation ? this.traceability.componentSerialOf(recuperation.componentId) : '';
  }
}
