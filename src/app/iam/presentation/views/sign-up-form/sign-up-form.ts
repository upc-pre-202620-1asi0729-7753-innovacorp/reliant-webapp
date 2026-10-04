import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {MatStepperModule} from '@angular/material/stepper';
import {MatFormFieldModule, MatError} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatRadioModule} from '@angular/material/radio';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {IamStore} from '../../../application/iam.store';
import {SignUpCommand} from '../../../domain/model/sign-up.command';
import {OrganizationType} from '../../../domain/model/organization.entity';

@Component({
  selector: 'app-sign-up-form',
  imports: [MatStepperModule, MatFormFieldModule, MatInputModule, MatRadioModule, MatButtonModule, MatCardModule, MatError, ReactiveFormsModule, TranslatePipe, RouterLink],
  templateUrl: './sign-up-form.html',
  styleUrl: './sign-up-form.css'
})
export class SignUpForm extends BaseForm {
  #fb = inject(FormBuilder);
  readonly store = inject(IamStore);

  organizationForm = this.#fb.group({
    organizationName: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    ruc: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{11}$/)] }),
    organizationType: new FormControl<OrganizationType>('RECUPERATION_SUPPLIER', { nonNullable: true, validators: [Validators.required] })
  });

  adminForm = this.#fb.group({
    fullName: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.minLength(8)] })
  });

  submit() {
    if (this.organizationForm.invalid || this.adminForm.invalid) return;
    const o = this.organizationForm.getRawValue();
    const a = this.adminForm.getRawValue();
    this.store.signUp(new SignUpCommand({
      organizationName: o.organizationName,
      ruc: o.ruc,
      organizationType: o.organizationType,
      fullName: a.fullName,
      email: a.email,
      password: a.password
    }));
  }
}
