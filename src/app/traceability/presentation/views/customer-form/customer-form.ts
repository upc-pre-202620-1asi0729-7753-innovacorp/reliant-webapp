import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {Customer} from '../../../domain/model/customer.entity';
import {TraceabilityStore} from '../../../application/traceability.store';

@Component({
  selector: 'app-customer-form',
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './customer-form.html',
  styleUrl: './customer-form.css'
})
export class CustomerForm extends BaseForm {
  #fb = inject(FormBuilder);
  #route = inject(ActivatedRoute);
  #router = inject(Router);
  #store = inject(TraceabilityStore);

  form = this.#fb.group({
    legalName: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    ruc: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/^\d{11}$/)] }),
    mineSite: new FormControl<string>('', { nonNullable: true })
  });

  isEdit = false;
  customerId: number | null = null;

  constructor() {
    super();
    this.#route.params.subscribe(params => {
      this.customerId = params['id'] ? +params['id'] : null;
      this.isEdit = !!this.customerId;
      if (this.isEdit && this.customerId) {
        const customer = this.#store.getCustomerById(this.customerId)();
        if (customer) {
          this.form.patchValue({ legalName: customer.legalName, ruc: customer.ruc, mineSite: customer.mineSite });
        }
      }
    });
  }

  submit() {
    if (this.form.invalid) return;
    const existing = this.customerId ? this.#store.getCustomerById(this.customerId)() : undefined;
    const customer = new Customer({
      id: this.customerId ?? 0,
      supplierOrganizationId: existing?.supplierOrganizationId ?? 1,
      linkedAssetOwnerOrganizationId: existing?.linkedAssetOwnerOrganizationId ?? null,
      legalName: this.form.value.legalName!,
      ruc: this.form.value.ruc!,
      mineSite: this.form.value.mineSite ?? ''
    });
    if (this.isEdit) {
      this.#store.updateCustomer(customer);
    } else {
      this.#store.addCustomer(customer);
    }
    this.#router.navigate(['traceability/customers']).then();
  }

  cancel() {
    this.#router.navigate(['traceability/customers']).then();
  }
}
