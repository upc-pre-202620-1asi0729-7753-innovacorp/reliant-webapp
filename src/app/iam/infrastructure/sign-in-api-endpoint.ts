import {environment} from '../../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {inject} from '@angular/core';
import {catchError, map, Observable} from 'rxjs';
import {ErrorHandlingEnabledBaseType} from '../../shared/infrastructure/error-handling-enabled-base-type';
import {SignInAssembler} from './sign-in-assembler';
import {SignInCommand} from '../domain/model/sign-in.command';
import {SignInResource, SignInResponse} from './sign-in-response';
import {SignInPort} from './sign-in.port';

const signInApiEndpointUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderSignInEndpointPath}`;

export class SignInApiEndpoint extends ErrorHandlingEnabledBaseType implements SignInPort {
  readonly #http = inject(HttpClient);
  readonly #assembler = new SignInAssembler();

  signIn(signInCommand: SignInCommand): Observable<SignInResource> {
    const request = this.#assembler.toRequestFromCommand(signInCommand);
    return this.#http.post<SignInResponse>(signInApiEndpointUrl, request).pipe(
      map(response => this.#assembler.toResourceFromResponse(response)),
      catchError(this.handleError('Failed to sign-in'))
    );
  }
}
