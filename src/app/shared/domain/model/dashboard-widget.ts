export type ChartType = 'line' | 'bar' | 'doughnut';

export type DashboardWidgetCode = 'deviationsByParameter' | 'sessionsByStatus';

export interface DashboardWidget {
  code: DashboardWidgetCode;
  chartType: ChartType;
}

export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidget[] = [
  { code: 'deviationsByParameter', chartType: 'bar' },
  { code: 'sessionsByStatus', chartType: 'doughnut' },
];
