import { Component, computed, input, output } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { ChartType } from '../../../domain/model/dashboard-widget';
import { BASE_CHART_OPTIONS, CHART_COLORS } from '../../chart-theme';

@Component({
  selector: 'app-chart-widget',
  imports: [BaseChartDirective, MatButtonToggleModule, MatIconModule],
  templateUrl: './chart-widget.html',
  styleUrl: './chart-widget.css',
})
export class ChartWidget {
  readonly title = input.required<string>();
  readonly labels = input.required<string[]>();
  readonly values = input.required<number[]>();
  readonly chartType = input<ChartType>('bar');
  readonly seriesLabel = input('');
  readonly chartTypeChange = output<ChartType>();

  readonly data = computed<ChartConfiguration['data']>(() => {
    const single = this.chartType() !== 'doughnut';

    return {
      labels: this.labels(),
      datasets: [
        {
          label: this.seriesLabel(),
          data: this.values(),
          backgroundColor: single ? CHART_COLORS.orange : CHART_COLORS.series,
          borderColor: single ? CHART_COLORS.navy : '#FFFFFF',
          borderWidth: single ? 2 : 1,
          borderRadius: 6,
          tension: 0.3,
          fill: false,
          pointBackgroundColor: CHART_COLORS.orange,
        },
      ],
    };
  });

  readonly options = computed<ChartConfiguration['options']>(() =>
    this.chartType() === 'doughnut'
      ? {
          ...BASE_CHART_OPTIONS,
          scales: {},
          plugins: {
            ...BASE_CHART_OPTIONS.plugins,
            legend: {
              position: 'right',
              labels: { font: { family: 'Poppins' } },
            },
          },
        }
      : {
          ...BASE_CHART_OPTIONS,
          plugins: {
            ...BASE_CHART_OPTIONS.plugins,
            legend: { display: false },
          },
        },
  );
}
