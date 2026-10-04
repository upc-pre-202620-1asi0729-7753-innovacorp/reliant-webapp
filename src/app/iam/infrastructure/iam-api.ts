import {inject, Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {SignUpCommand} from '../domain/model/sign-up.command';
import {SignUpResource} from './sign-up-response';
import {SIGN_UP_PORT} from './sign-up.port';
import {SignInCommand} from '../domain/model/sign-in.command';
import {SignInResource} from './sign-in-response';
import {SIGN_IN_PORT} from './sign-in.port';

@Injectable({providedIn: 'root'})
export class IamApi extends BaseApi {
  readonly #signUpEndpoint = inject(SIGN_UP_PORT);
  readonly #signInEndpoint = inject(SIGN_IN_PORT);

  signUp(signUpCommand: SignUpCommand): Observable<SignUpResource> {
    return this.#signUpEndpoint.signUp(signUpCommand);
  }

  signIn(signInCommand: SignInCommand): Observable<SignInResource> {
    return this.#signInEndpoint.signIn(signInCommand);
  }
}
