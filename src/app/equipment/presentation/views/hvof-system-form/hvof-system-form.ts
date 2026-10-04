import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {FuelType, HvofSystem} from '../../../domain/model/hvof-system.entity';
import {EquipmentStore} from '../../../application/equipment.store';
import {IamStore} from '../../../../iam/application/iam.store';

@Component({
  selector: 'app-hvof-system-form',
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './hvof-system-form.html',
  styleUrl: './hvof-system-form.css'
})
export class HvofSystemForm extends BaseForm {
  #fb = inject(FormBuilder);
  #route = inject(ActivatedRoute);
  #router = inject(Router);
  readonly store = inject(EquipmentStore);

  readonly fuelTypes: FuelType[] = ['HYDROGEN', 'PROPANE', 'KEROSENE', 'NATURAL_GAS'];

  readonly iam = inject(IamStore);

  form = this.#fb.group({
    code: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    serialNumber: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    systemManufacturer: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    systemModel: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    fuelType: new FormControl<FuelType>('HYDROGEN', { nonNullable: true, validators: [Validators.required] })
  });

  isEdit = false;
  systemId: number | null = null;

  constructor() {
    super();
    this.#route.params.subscribe(params => {
      this.systemId = params['id'] ? +params['id'] : null;
      this.isEdit = !!this.systemId;
      if (this.isEdit && this.systemId) {
        const s = this.store.getHvofSystemById(this.systemId)();
        if (s) {
          this.form.patchValue({ code: s.code, serialNumber: s.serialNumber, systemManufacturer: s.systemManufacturer, systemModel: s.systemModel, fuelType: s.fuelType });
        }
      }
    });
  }

  submit() {
    if (this.form.invalid) return;
    const existing = this.systemId ? this.store.getHvofSystemById(this.systemId)() : undefined;
    const v = this.form.getRawValue();
    const system = new HvofSystem({
      id: this.systemId ?? 0,
      code: v.code,
      organizationId: existing?.organizationId ?? this.iam.organizationId()!,
      serialNumber: v.serialNumber,
      status: existing?.status ?? 'ACTIVE',
      systemManufacturer: v.systemManufacturer,
      systemModel: v.systemModel,
      fuelType: v.fuelType,
      tagMappings: existing?.tagMappings ?? []
    });
    if (this.isEdit) {
      this.store.updateHvofSystem(system);
    } else {
      this.store.addHvofSystem(system);
    }
    this.#router.navigate(['equipment/hvof-systems']).then();
  }

  cancel() {
    this.#router.navigate(['equipment/hvof-systems']).then();
  }
}
