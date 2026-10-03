import {inject, Injectable, signal} from '@angular/core';
import {Router} from '@angular/router';
import {IamApi} from '../infrastructure/iam-api';
import {SignUpCommand} from '../domain/model/sign-up.command';

@Injectable({providedIn: 'root'})
export class IamStore {
  readonly #iamApi = inject(IamApi);
  readonly #router = inject(Router);

  readonly #errorSignal = signal<string | null>(null);
  readonly error = this.#errorSignal.asReadonly();

  signUp(signUpCommand: SignUpCommand) {
    this.#errorSignal.set(null);
    this.#iamApi.signUp(signUpCommand).subscribe({
      next: () => this.#router.navigate(['/iam/sign-in']).then(),
      error: (err: Error) => {
        console.error('Sign-up failed:', err);
        this.#errorSignal.set(err.message);
      }
    });
  }
}
