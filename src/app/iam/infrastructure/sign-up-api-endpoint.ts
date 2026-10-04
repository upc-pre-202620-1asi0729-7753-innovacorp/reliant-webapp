import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, map, Observable} from 'rxjs';
import {ErrorHandlingEnabledBaseType} from '../../shared/infrastructure/error-handling-enabled-base-type';
import {SignUpAssembler} from './sign-up-assembler';
import {SignUpResource, SignUpResponse} from './sign-up-response';
import {SignUpCommand} from '../domain/model/sign-up.command';
import {SignUpPort} from './sign-up.port';

const signUpApiEndpointUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderSignUpEndpointPath}`;

export class SignUpApiEndpoint extends ErrorHandlingEnabledBaseType implements SignUpPort {
  readonly #http = inject(HttpClient);
  readonly #assembler = new SignUpAssembler();

  signUp(signUpCommand: SignUpCommand): Observable<SignUpResource> {
    const request = this.#assembler.toRequestFromCommand(signUpCommand);
    return this.#http.post<SignUpResponse>(signUpApiEndpointUrl, request).pipe(
      map(response => this.#assembler.toResourceFromResponse(response)),
      catchError(this.handleError('Failed to sign-up'))
    );
  }
}
