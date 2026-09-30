import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {provideNativeDateAdapter} from '@angular/material/core';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {Recuperation} from '../../../domain/model/recuperation.entity';
import {TraceabilityStore} from '../../../application/traceability.store';

@Component({
  selector: 'app-recuperation-form',
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule, MatButtonModule, ReactiveFormsModule, TranslatePipe],
  providers: [provideNativeDateAdapter()],
  templateUrl: './recuperation-form.html',
  styleUrl: './recuperation-form.css'
})
export class RecuperationForm extends BaseForm {
  #fb = inject(FormBuilder);
  #route = inject(ActivatedRoute);
  #router = inject(Router);
  readonly store = inject(TraceabilityStore);

  readonly weightUnits = ['kg', 'lb'];

  form = this.#fb.group({
    componentId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    customerId: new FormControl<number | null>({ value: null, disabled: true }),
    workOrderNumber: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    manufacturingOrderNumber: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    segment: new FormControl<string>('Mining', { nonNullable: true }),
    operation: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    weightValue: new FormControl<number>(0, { nonNullable: true, validators: [Validators.min(0)] }),
    weightUnitSymbol: new FormControl<string>('kg', { nonNullable: true }),
    hourmeterAtEntry: new FormControl<number>(0, { nonNullable: true, validators: [Validators.min(0)] }),
    powderSupplier: new FormControl<string>('', { nonNullable: true }),
    powderLotNumber: new FormControl<string>('', { nonNullable: true }),
    powderChemicalComposition: new FormControl<string>('', { nonNullable: true }),
    receivedAt: new FormControl<Date>(new Date(), { nonNullable: true, validators: [Validators.required] })
  });

  isEdit = false;
  recuperationId: number | null = null;

  constructor() {
    super();
    this.form.controls.componentId.valueChanges.subscribe(componentId => {
      const component = componentId ? this.store.getComponentById(componentId)() : undefined;
      this.form.controls.customerId.setValue(component?.customerId ?? null);
    });
    this.#route.params.subscribe(params => {
      this.recuperationId = params['id'] ? +params['id'] : null;
      this.isEdit = !!this.recuperationId;
      if (this.isEdit && this.recuperationId) {
        const r = this.store.getRecuperationById(this.recuperationId)();
        if (r) {
          this.form.patchValue({
            componentId: r.componentId,
            workOrderNumber: r.workOrderNumber,
            manufacturingOrderNumber: r.manufacturingOrderNumber,
            segment: r.segment,
            operation: r.operation,
            weightValue: r.weightValue,
            weightUnitSymbol: r.weightUnitSymbol,
            hourmeterAtEntry: r.hourmeterAtEntry,
            powderSupplier: r.powderSupplier,
            powderLotNumber: r.powderLotNumber,
            powderChemicalComposition: r.powderChemicalComposition,
            receivedAt: new Date(r.receivedAt)
          });
        }
      }
    });
  }

  submit() {
    if (this.form.invalid) return;
    const existing = this.recuperationId ? this.store.getRecuperationById(this.recuperationId)() : undefined;
    const v = this.form.getRawValue();
    const recuperation = new Recuperation({
      id: this.recuperationId ?? 0,
      workOrderNumber: v.workOrderNumber,
      manufacturingOrderNumber: v.manufacturingOrderNumber,
      componentId: v.componentId!,
      customerId: v.customerId!,
      supplierOrganizationId: existing?.supplierOrganizationId ?? 1,
      segment: v.segment,
      operation: v.operation,
      weightValue: v.weightValue,
      weightUnitSymbol: v.weightUnitSymbol,
      hourmeterAtEntry: v.hourmeterAtEntry,
      powderSupplier: v.powderSupplier,
      powderLotNumber: v.powderLotNumber,
      powderChemicalComposition: v.powderChemicalComposition,
      status: existing?.status ?? 'RECEIVED',
      receivedAt: v.receivedAt.toISOString().substring(0, 10),
      completedAt: existing?.completedAt ?? null,
      linkedSessions: existing?.linkedSessions ?? []
    });
    if (this.isEdit) {
      this.store.updateRecuperation(recuperation);
    } else {
      this.store.addRecuperation(recuperation);
    }
    this.#router.navigate(['traceability/recuperations']).then();
  }

  cancel() {
    this.#router.navigate(['traceability/recuperations']).then();
  }
}
