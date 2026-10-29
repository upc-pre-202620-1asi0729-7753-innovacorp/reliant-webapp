import { BaseResource, BaseResponse } from './base-response';
import { DashboardWidget } from '../domain/model/dashboard-widget';

export interface UserPreferencesResource extends BaseResource {
  id: number;
  userId: number;
  defaultUnitSystem: string;
  language: string;
  unitOverrides?: unknown[];
  dashboardWidgets?: DashboardWidget[];
}

export interface UserPreferencesResponse extends BaseResponse {
  userPreferences: UserPreferencesResource[];
}
