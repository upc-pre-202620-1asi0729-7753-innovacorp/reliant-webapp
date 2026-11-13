import {computed, Injectable, signal} from '@angular/core';
import {ChartType, DashboardWidget, DashboardWidgetCode, DEFAULT_DASHBOARD_WIDGETS} from '../domain/model/dashboard-widget';

const WIDGETS_KEY = 'reliant.dashboard-widgets';

function restore(): DashboardWidget[] {
  try {
    const raw = localStorage.getItem(WIDGETS_KEY);
    return raw ? (JSON.parse(raw) as DashboardWidget[]) : DEFAULT_DASHBOARD_WIDGETS;
  } catch {
    return DEFAULT_DASHBOARD_WIDGETS;
  }
}

/** Chart preferences of the dashboard, kept in the browser of the user. */
@Injectable({providedIn: 'root'})
export class DashboardStore {
  readonly #widgetsSignal = signal<DashboardWidget[]>(restore());
  readonly widgets = this.#widgetsSignal.asReadonly();
  readonly #errorSignal = signal<string | null>(null);
  readonly error = this.#errorSignal.asReadonly();

  readonly chartTypes = computed(() => new Map(this.widgets().map(w => [w.code, w.chartType])));

  chartTypeOf(code: DashboardWidgetCode): ChartType {
    return this.chartTypes().get(code) ?? 'bar';
  }

  setChartType(code: DashboardWidgetCode, chartType: ChartType): void {
    const next = this.widgets().some(w => w.code === code)
      ? this.widgets().map(w => (w.code === code ? {...w, chartType} : w))
      : [...this.widgets(), {code, chartType}];
    this.#widgetsSignal.set(next);
    try {
      localStorage.setItem(WIDGETS_KEY, JSON.stringify(next));
    } catch {
      this.#errorSignal.set('Failed to save preferences');
    }
  }
}
