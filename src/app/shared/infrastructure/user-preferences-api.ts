import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseApi } from './base-api';
import { UserPreferencesApiEndpoint } from './user-preferences-api-endpoint';
import { UserPreferences } from '../domain/model/user-preferences.entity';
import { DashboardWidget } from '../domain/model/dashboard-widget';

@Injectable({ providedIn: 'root' })
export class UserPreferencesApi extends BaseApi {
  readonly #endpoint = new UserPreferencesApiEndpoint(this.http);

  getByUserId(userId: number): Observable<UserPreferences | undefined> {
    return this.#endpoint.getAllBy({ userId }).pipe(map((list) => list[0]));
  }

  updateDashboardWidgets(id: number, widgets: DashboardWidget[]): Observable<UserPreferences> {
    return this.#endpoint.patch(id, { dashboardWidgets: widgets });
  }
}
