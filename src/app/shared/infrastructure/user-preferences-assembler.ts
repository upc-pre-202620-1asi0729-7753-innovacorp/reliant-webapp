import { BaseAssembler } from './base-assembler';
import { UserPreferences } from '../domain/model/user-preferences.entity';
import { UserPreferencesResource, UserPreferencesResponse } from './user-preferences-response';
import { DEFAULT_DASHBOARD_WIDGETS } from '../domain/model/dashboard-widget';

export class UserPreferencesAssembler implements BaseAssembler<
  UserPreferences,
  UserPreferencesResource,
  UserPreferencesResponse
> {
  toEntityFromResource(resource: UserPreferencesResource): UserPreferences {
    return new UserPreferences({
      id: resource.id,
      userId: resource.userId,
      defaultUnitSystem: resource.defaultUnitSystem,
      language: resource.language,
      dashboardWidgets: resource.dashboardWidgets ?? DEFAULT_DASHBOARD_WIDGETS,
    });
  }

  toResourceFromEntity(entity: UserPreferences): UserPreferencesResource {
    return {
      id: entity.id,
      userId: entity.userId,
      defaultUnitSystem: entity.defaultUnitSystem,
      language: entity.language,
      dashboardWidgets: entity.dashboardWidgets,
    };
  }

  toEntitiesFromResponse(response: UserPreferencesResponse): UserPreferences[] {
    return response.userPreferences.map((r) => this.toEntityFromResource(r));
  }
}
