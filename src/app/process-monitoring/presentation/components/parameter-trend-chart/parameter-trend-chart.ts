import { Component, computed, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { TranslatePipe } from '@ngx-translate/core';
import { ProcessReading } from '../../../domain/model/process-reading.entity';
import { RecipeParameter } from '../../../../equipment/domain/model/recipe.entity';
import { BASE_CHART_OPTIONS, CHART_COLORS } from '../../../../shared/presentation/chart-theme';

@Component({
  selector: 'app-parameter-trend-chart',
  imports: [BaseChartDirective, TranslatePipe],
  templateUrl: './parameter-trend-chart.html',
  styleUrl: './parameter-trend-chart.css',
})
export class ParameterTrendChart {
  readonly readings = input.required<ProcessReading[]>();
  readonly parameter = input.required<string>();
  readonly recipeParameter = input<RecipeParameter | undefined>();
  readonly maxPoints = input(120);

  readonly series = computed(() =>
    this.readings()
      .filter((r) => r.parameter === this.parameter())
      .slice(-this.maxPoints()),
  );

  readonly unit = computed(
    () => this.series()[0]?.unitSymbol ?? this.recipeParameter()?.unitSymbol ?? '',
  );

  readonly data = computed<ChartConfiguration<'line'>['data']>(() => {
    const points = this.series();
    const labels = points.map((r) =>
      r.timestamp.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    );
    const p = this.recipeParameter();

    const band = (value: number, fill: false | string, color: string) => ({
      data: points.map(() => value),
      borderWidth: 0,
      pointRadius: 0,
      fill,
      backgroundColor: color,
      borderColor: 'transparent',
      order: 10,
    });

    const datasets: ChartConfiguration<'line'>['data']['datasets'] = [
      {
        label: this.parameter(),
        data: points.map((r) => r.value),
        borderColor: CHART_COLORS.navy,
        backgroundColor: CHART_COLORS.navy,
        pointRadius: points.map((r) => (r.band === 'nominal' ? 0 : 4)),
        pointBackgroundColor: points.map((r) =>
          r.band === 'shutdown'
            ? CHART_COLORS.fault
            : r.band === 'nominal'
              ? CHART_COLORS.navy
              : CHART_COLORS.warn,
        ),
        borderWidth: 2,
        tension: 0.25,
        order: 1,
      },
    ];

    if (p) {
      datasets.push(
        { ...band(p.upperShutdown, false, 'transparent'), label: 'upperShutdown' },
        { ...band(p.upperWarning, '-1', CHART_COLORS.faultBg), label: 'upperWarning' },
        { ...band(p.nominalMax, '-1', CHART_COLORS.warnBg), label: 'nominalMax' },
        { ...band(p.nominalMin, '-1', CHART_COLORS.okBg), label: 'nominalMin' },
        { ...band(p.lowerWarning, '-1', CHART_COLORS.warnBg), label: 'lowerWarning' },
        { ...band(p.lowerShutdown, '-1', CHART_COLORS.faultBg), label: 'lowerShutdown' },
        {
          label: 'setpoint',
          data: points.map(() => p.setpoint),
          borderColor: CHART_COLORS.ok,
          borderDash: [6, 4],
          borderWidth: 1,
          pointRadius: 0,
          fill: false,
          order: 5,
        },
      );
    }

    return { labels, datasets };
  });

  readonly options = computed<ChartConfiguration<'line'>['options']>(() => {
    const p = this.recipeParameter();

    return {
      ...BASE_CHART_OPTIONS,
      plugins: {
        ...BASE_CHART_OPTIONS.plugins,
        legend: { display: false },
        tooltip: {
          ...BASE_CHART_OPTIONS.plugins?.tooltip,
          filter: (item) => item.datasetIndex === 0,
        },
      },
      scales: {
        ...BASE_CHART_OPTIONS.scales,
        y: {
          ...BASE_CHART_OPTIONS.scales?.['y'],
          suggestedMin: p ? p.lowerShutdown - (p.upperShutdown - p.lowerShutdown) * 0.1 : undefined,
          suggestedMax: p ? p.upperShutdown + (p.upperShutdown - p.lowerShutdown) * 0.1 : undefined,
          title: {
            display: !!this.unit(),
            text: this.unit(),
            font: { family: 'Poppins', size: 11 },
          },
        },
      },
    };
  });
}

