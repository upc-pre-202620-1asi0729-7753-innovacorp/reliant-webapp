import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {ComponentType, RecoveredComponent} from '../../../domain/model/component.entity';
import {TraceabilityStore} from '../../../application/traceability.store';

@Component({
  selector: 'app-component-form',
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './component-form.html',
  styleUrl: './component-form.css'
})
export class ComponentForm extends BaseForm {
  #fb = inject(FormBuilder);
  #route = inject(ActivatedRoute);
  #router = inject(Router);
  readonly store = inject(TraceabilityStore);

  readonly componentTypes: ComponentType[] = ['HYDRAULIC_ROD', 'CYLINDER_BLOCK', 'SHAFT', 'IMPELLER', 'OTHER'];

  form = this.#fb.group({
    serialNumber: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    partNumber: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    componentType: new FormControl<ComponentType>('HYDRAULIC_ROD', { nonNullable: true, validators: [Validators.required] }),
    machineManufacturer: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    machineModel: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    customerId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    pcrTargetHours: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(1)] })
  });

  isEdit = false;
  componentId: number | null = null;

  constructor() {
    super();
    this.#route.params.subscribe(params => {
      this.componentId = params['id'] ? +params['id'] : null;
      this.isEdit = !!this.componentId;
      if (this.isEdit && this.componentId) {
        const component = this.store.getComponentById(this.componentId)();
        if (component) {
          this.form.patchValue({
            serialNumber: component.serialNumber,
            partNumber: component.partNumber,
            componentType: component.componentType,
            machineManufacturer: component.machineManufacturer,
            machineModel: component.machineModel,
            customerId: component.customerId,
            pcrTargetHours: component.pcrTargetHours
          });
        }
      }
    });
  }

  submit() {
    if (this.form.invalid) return;
    const existing = this.componentId ? this.store.getComponentById(this.componentId)() : undefined;
    const component = new RecoveredComponent({
      id: this.componentId ?? 0,
      serialNumber: this.form.value.serialNumber!,
      partNumber: this.form.value.partNumber!,
      componentType: this.form.value.componentType!,
      machineManufacturer: this.form.value.machineManufacturer!,
      machineModel: this.form.value.machineModel!,
      customerId: this.form.value.customerId!,
      pcrTargetHours: this.form.value.pcrTargetHours!,
      status: existing?.status ?? 'RECEIVED'
    });
    if (this.isEdit) {
      this.store.updateComponent(component);
    } else {
      this.store.addComponent(component);
    }
    this.#router.navigate(['traceability/components']).then();
  }

  cancel() {
    this.#router.navigate(['traceability/components']).then();
  }
}
