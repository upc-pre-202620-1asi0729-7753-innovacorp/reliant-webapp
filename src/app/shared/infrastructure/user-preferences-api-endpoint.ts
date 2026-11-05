import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from './base-api-endpoint';
import { UserPreferences } from '../domain/model/user-preferences.entity';
import { UserPreferencesResource, UserPreferencesResponse } from './user-preferences-response';
import { UserPreferencesAssembler } from './user-preferences-assembler';
import { environment } from '../../../environments/environment';

export class UserPreferencesApiEndpoint extends BaseApiEndpoint<
  UserPreferences,
  UserPreferencesResource,
  UserPreferencesResponse,
  UserPreferencesAssembler
> {
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.platformProviderApiBaseUrl}${environment.platformProviderUserPreferencesEndpointPath}`,
      new UserPreferencesAssembler(),
    );
  }
}
