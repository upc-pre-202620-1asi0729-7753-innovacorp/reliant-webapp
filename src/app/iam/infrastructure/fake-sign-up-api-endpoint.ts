import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, map, Observable, switchMap, throwError} from 'rxjs';
import {SignUpCommand} from '../domain/model/sign-up.command';
import {SignUpResource} from './sign-up-response';
import {SignUpPort} from './sign-up.port';

const organizationsUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderOrganizationsEndpointPath}`;
const usersUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderUsersEndpointPath}`;
const ORG_ADMIN_ROLE_ID = 1;

export class FakeSignUpApiEndpoint implements SignUpPort {
  readonly #http = inject(HttpClient);

  signUp(command: SignUpCommand): Observable<SignUpResource> {
    const organization = {
      name: command.organizationName,
      ruc: command.ruc,
      organizationType: command.organizationType,
      status: 'ACTIVE',
      timeZone: 'America/Lima'
    };
    return this.#http.post<{ id: number }>(organizationsUrl, organization).pipe(
      switchMap(createdOrg => this.#http.post<SignUpResource & { password: string }>(usersUrl, {
        fullName: command.fullName,
        email: command.email,
        password: command.password,
        organizationId: createdOrg.id,
        status: 'ACTIVE',
        roleIds: [{roleId: ORG_ADMIN_ROLE_ID}]
      })),
      map(user => ({id: user.id, email: user.email, fullName: user.fullName, organizationId: user.organizationId})),
      catchError(error => throwError(() => new Error(`Failed to sign-up: ${error.message}`)))
    );
  }
}
