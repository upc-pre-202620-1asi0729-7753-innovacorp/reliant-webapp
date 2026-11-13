import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {User} from '../domain/model/user.entity';
import {UserResource, UsersResponse} from './users-response';
import {UserAssembler} from './user-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

export class UsersApiEndpoint extends BaseApiEndpoint<User, UserResource, UsersResponse, UserAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderUsersEndpointPath}`, new UserAssembler());
  }

  /** PUT /users/{id}/roles replaces the whole role set of the user. */
  assignRoles(userId: number, roleIds: number[]): Observable<User> {
    return this.http.put<UserResource>(`${this.endpointUrl}/${userId}/roles`, {roleIds}).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to assign roles'))
    );
  }
}
