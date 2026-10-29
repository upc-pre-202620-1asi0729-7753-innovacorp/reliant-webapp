import { BaseEntity } from './base-entity';
import { DashboardWidget } from './dashboard-widget';

export class UserPreferences implements BaseEntity {
  #id: number;
  #userId: number;
  #defaultUnitSystem: string;
  #language: string;
  #dashboardWidgets: DashboardWidget[];

  constructor(props: {
    id: number;
    userId: number;
    defaultUnitSystem: string;
    language: string;
    dashboardWidgets: DashboardWidget[];
  }) {
    this.#id = props.id;
    this.#userId = props.userId;
    this.#defaultUnitSystem = props.defaultUnitSystem;
    this.#language = props.language;
    this.#dashboardWidgets = props.dashboardWidgets;
  }

  get id(): number {
    return this.#id;
  }
  set id(value: number) {
    this.#id = value;
  }

  get userId(): number {
    return this.#userId;
  }
  get defaultUnitSystem(): string {
    return this.#defaultUnitSystem;
  }
  get language(): string {
    return this.#language;
  }

  get dashboardWidgets(): DashboardWidget[] {
    return this.#dashboardWidgets;
  }

  set dashboardWidgets(value: DashboardWidget[]) {
    this.#dashboardWidgets = value;
  }
}
