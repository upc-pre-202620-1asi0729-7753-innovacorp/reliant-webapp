export type ChartType = 'line' | 'bar' | 'doughnut';

export interface DashboardWidget {
  code: string;
  chartType: ChartType;
}
