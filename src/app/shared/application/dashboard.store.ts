import { computed, inject, Injectable, signal } from '@angular/core';
import { IamStore } from '../../iam/application/iam.store';
import { UserPreferencesApi } from '../infrastructure/user-preferences-api';
import { UserPreferences } from '../domain/model/user-preferences.entity';
import {
  ChartType,
  DashboardWidget,
  DashboardWidgetCode,
  DEFAULT_DASHBOARD_WIDGETS,
} from '../domain/model/dashboard-widget';

@Injectable({ providedIn: 'root' })
export class DashboardStore {
  readonly #api = inject(UserPreferencesApi);
  readonly #iam = inject(IamStore);

  readonly #preferencesSignal = signal<UserPreferences | null>(null);

  readonly widgets = computed<DashboardWidget[]>(
    () => this.#preferencesSignal()?.dashboardWidgets ?? DEFAULT_DASHBOARD_WIDGETS,
  );

  readonly #errorSignal = signal<string | null>(null);
  readonly error = this.#errorSignal.asReadonly();

  load(): void {
    const userId = this.#iam.userId();

    if (!userId) return;

    this.#api.getByUserId(userId).subscribe({
      next: (preferences) => this.#preferencesSignal.set(preferences ?? null),
      error: (err) =>
        this.#errorSignal.set(err instanceof Error ? err.message : 'Failed to load preferences'),
    });
  }

  chartTypeOf(code: DashboardWidgetCode): ChartType {
    return this.widgets().find((widget) => widget.code === code)?.chartType ?? 'bar';
  }

  setChartType(code: DashboardWidgetCode, chartType: ChartType): void {
    const next = this.widgets().some((widget) => widget.code === code)
      ? this.widgets().map((widget) => (widget.code === code ? { ...widget, chartType } : widget))
      : [...this.widgets(), { code, chartType }];

    const preferences = this.#preferencesSignal();

    if (!preferences) return;

    preferences.dashboardWidgets = next;

    this.#preferencesSignal.set(
      new UserPreferences({
        id: preferences.id,
        userId: preferences.userId,
        defaultUnitSystem: preferences.defaultUnitSystem,
        language: preferences.language,
        dashboardWidgets: next,
      }),
    );

    this.#api.updateDashboardWidgets(preferences.id, next).subscribe({
      error: (err) =>
        this.#errorSignal.set(err instanceof Error ? err.message : 'Failed to save preferences'),
    });
  }
}
