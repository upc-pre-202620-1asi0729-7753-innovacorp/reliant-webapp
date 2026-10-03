import {environment} from '../../../environments/environment';
import {HttpClient, HttpParams} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, map, Observable, switchMap, throwError} from 'rxjs';
import {SignInCommand} from '../domain/model/sign-in.command';
import {SignInResource} from './sign-in-response';
import {SignInPort} from './sign-in.port';
import {OrganizationType} from '../domain/model/organization.entity';

const usersUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderUsersEndpointPath}`;
const organizationsUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderOrganizationsEndpointPath}`;

interface FakeUser { id: number; email: string; fullName: string; organizationId: number; roleIds: { roleId: number }[]; }
interface FakeOrganization { id: number; organizationType: OrganizationType; }

export class FakeSignInApiEndpoint implements SignInPort {
  readonly #http = inject(HttpClient);

  signIn(command: SignInCommand): Observable<SignInResource> {
    const params = new HttpParams().set('email', command.email).set('password', command.password);
    return this.#http.get<FakeUser[]>(usersUrl, {params}).pipe(
      switchMap(users => {
        if (users.length === 0) {
          throw new Error('Invalid email or password');
        }
        const user = users[0];
        return this.#http.get<FakeOrganization>(`${organizationsUrl}/${user.organizationId}`).pipe(
          map(org => ({
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            organizationId: user.organizationId,
            organizationType: org.organizationType,
            roleIds: user.roleIds ?? [],
            token: `fake-token-${user.id}`
          } as SignInResource))
        );
      }),
      catchError(error => throwError(() => new Error(`Failed to sign-in: ${error.message}`)))
    );
  }
}
