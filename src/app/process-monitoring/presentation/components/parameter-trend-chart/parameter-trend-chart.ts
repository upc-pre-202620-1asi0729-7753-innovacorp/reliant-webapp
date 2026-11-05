import {Component, computed, input} from '@angular/core';
import {BaseChartDirective} from 'ng2-charts';
import {ChartConfiguration} from 'chart.js';
import {TranslatePipe} from '@ngx-translate/core';
import {ProcessReading} from '../../../domain/model/process-reading.entity';
import {RecipeParameter} from '../../../../equipment/domain/model/recipe.entity';
import {BASE_CHART_OPTIONS, CHART_COLORS} from '../../../../shared/presentation/chart-theme';

@Component({
  selector: 'app-parameter-trend-chart',
  imports: [BaseChartDirective, TranslatePipe],
  templateUrl: './parameter-trend-chart.html',
  styleUrl: './parameter-trend-chart.css'
})
export class ParameterTrendChart {
  readonly readings = input.required<ProcessReading[]>();
  readonly parameter = input.required<string>();
  readonly recipeParameter = input<RecipeParameter | undefined>();
  readonly maxPoints = input(120);

  readonly series = computed(() =>
    this.readings()
      .filter(r => r.parameter === this.parameter())
      .slice(-this.maxPoints())
  );

  readonly unit = computed(() =>
    this.series()[0]?.unitSymbol ?? this.recipeParameter()?.unitSymbol ?? ''
  );

  readonly data = computed<ChartConfiguration<'line'>['data']>(() => {
    const points = this.series();
    const recipe = this.recipeParameter();

    const labels = points.map(r =>
      r.timestamp.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    );

    const datasets: ChartConfiguration<'line'>['data']['datasets'] = [{
      label: this.parameter(),
      data: points.map(r => r.value),
      borderColor: CHART_COLORS.navy,
      backgroundColor: CHART_COLORS.navy,
      pointRadius: points.map(r => r.band === 'nominal' ? 0 : 4),
      pointBackgroundColor: points.map(r =>
        r.band === 'shutdown' ? CHART_COLORS.fault :
        r.band === 'nominal' ? CHART_COLORS.navy :
        CHART_COLORS.warn
      ),
      borderWidth: 2,
      tension: 0.25,
      order: 1
    }];

    const band = (value: number, fill: false | string, color: string) => ({
      label: '',
      data: points.map(() => value),
      borderWidth: 0,
      pointRadius: 0,
      fill,
      backgroundColor: color,
      borderColor: 'transparent',
      order: 10
    });

    if (recipe) {
      datasets.push(
        {...band(recipe.upperShutdown, false, 'transparent'), label: 'upperShutdown'},
        {...band(recipe.upperWarning, '-1', CHART_COLORS.faultBg), label: 'upperWarning'},
        {...band(recipe.nominalMax, '-1', CHART_COLORS.warnBg), label: 'nominalMax'},
        {...band(recipe.nominalMin, '-1', CHART_COLORS.okBg), label: 'nominalMin'},
        {...band(recipe.lowerWarning, '-1', CHART_COLORS.warnBg), label: 'lowerWarning'},
        {...band(recipe.lowerShutdown, '-1', CHART_COLORS.faultBg), label: 'lowerShutdown'},
        {
          label: 'setpoint',
          data: points.map(() => recipe.setpoint),
          borderColor: CHART_COLORS.ok,
          borderDash: [6, 4],
          borderWidth: 1,
          pointRadius: 0,
          fill: false,
          order: 5
        }
      );
    }

    return {labels, datasets};
  });

  readonly options = computed<ChartConfiguration<'line'>['options']>(() => {
    const recipe = this.recipeParameter();

    return {
      ...BASE_CHART_OPTIONS,
      plugins: {
        ...BASE_CHART_OPTIONS.plugins,
        legend: {display: false}
      },
      scales: {
        x: {...BASE_CHART_OPTIONS.scales?.['x']},
        y: {
          ...BASE_CHART_OPTIONS.scales?.['y'],
          ...(recipe ? {
            suggestedMin: recipe.lowerShutdown -
              (recipe.upperShutdown - recipe.lowerShutdown) * 0.1,
            suggestedMax: recipe.upperShutdown +
              (recipe.upperShutdown - recipe.lowerShutdown) * 0.1
          } : {}),
          title: {
            display: !!this.unit(),
            text: this.unit(),
            font: {family: 'Poppins', size: 11}
          }
        }
      }
    } as ChartConfiguration<'line'>['options'];
  });
}
