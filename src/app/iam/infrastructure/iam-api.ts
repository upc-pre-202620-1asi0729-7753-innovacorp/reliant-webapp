import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {SignUpCommand} from '../domain/model/sign-up.command';
import {SignUpResource} from './sign-up-response';
import {SIGN_UP_PORT} from './sign-up.port';
import {SignInCommand} from '../domain/model/sign-in.command';
import {SignInResource} from './sign-in-response';
import {SIGN_IN_PORT} from './sign-in.port';
import {User} from '../domain/model/user.entity';
import {Role} from '../domain/model/role.entity';
import {UsersApiEndpoint} from './users-api-endpoint';
import {RolesApiEndpoint} from './roles-api-endpoint';

@Injectable({providedIn: 'root'})
export class IamApi extends BaseApi {
  readonly #signUpEndpoint = inject(SIGN_UP_PORT);
  readonly #signInEndpoint = inject(SIGN_IN_PORT);
  readonly #usersEndpoint = new UsersApiEndpoint(this.http);
  readonly #rolesEndpoint = new RolesApiEndpoint(this.http);

  signUp(signUpCommand: SignUpCommand): Observable<SignUpResource> {
    return this.#signUpEndpoint.signUp(signUpCommand);
  }

  signIn(signInCommand: SignInCommand): Observable<SignInResource> {
    return this.#signInEndpoint.signIn(signInCommand);
  }

  getRoles(): Observable<Role[]> {
    return this.#rolesEndpoint.getAll();
  }

  getUsersByOrganizationId(organizationId: number): Observable<User[]> {
    return this.#usersEndpoint.getAllBy({organizationId});
  }

  updateUserRoles(userId: number, roleIds: { roleId: number }[]): Observable<User> {
    return this.#usersEndpoint.patch(userId, {roleIds});
  }

  inviteUser(user: User, password: string): Observable<User> {
    return this.#usersEndpoint.create(Object.assign(user, {})).pipe();
  }
}
