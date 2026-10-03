import {InjectionToken} from '@angular/core';
import {Observable} from 'rxjs';
import {SignUpCommand} from '../domain/model/sign-up.command';
import {SignUpResource} from './sign-up-response';

export interface SignUpPort {
  signUp(signUpCommand: SignUpCommand): Observable<SignUpResource>;
}

export const SIGN_UP_PORT = new InjectionToken<SignUpPort>('SIGN_UP_PORT');
