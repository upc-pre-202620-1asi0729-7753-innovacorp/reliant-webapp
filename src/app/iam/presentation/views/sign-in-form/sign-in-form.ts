import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {MatFormFieldModule, MatError} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {IamStore} from '../../../application/iam.store';
import {SignInCommand} from '../../../domain/model/sign-in.command';

@Component({
  selector: 'app-sign-in-form',
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule, MatError, ReactiveFormsModule, TranslatePipe, RouterLink],
  templateUrl: './sign-in-form.html',
  styleUrl: './sign-in-form.css'
})
export class SignInForm extends BaseForm {
  #fb = inject(FormBuilder);
  readonly store = inject(IamStore);

  form = this.#fb.group({
    email: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] })
  });

  submit() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.store.signIn(new SignInCommand({email: v.email, password: v.password}));
  }
}
