import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {HvofPart, PartType} from '../../../domain/model/hvof-part.entity';
import {EquipmentStore} from '../../../application/equipment.store';

@Component({
  selector: 'app-hvof-part-form',
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './hvof-part-form.html',
  styleUrl: './hvof-part-form.css'
})
export class HvofPartForm extends BaseForm {
  #fb = inject(FormBuilder);
  #route = inject(ActivatedRoute);
  #router = inject(Router);
  readonly store = inject(EquipmentStore);

  readonly partTypes: PartType[] = ['MASS_FLOW_CONTROLLER', 'HOPPER', 'CARRIER_GAS_MFC', 'COOLANT_PUMP', 'TEMPERATURE_SENSOR', 'SPINDLE_VFD', 'AXIS_DRIVE', 'NOZZLE'];

  form = this.#fb.group({
    partType: new FormControl<PartType>('MASS_FLOW_CONTROLLER', { nonNullable: true, validators: [Validators.required] }),
    serialNumber: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    manufacturer: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] })
  });

  systemId = 0;
  subsystemId = 0;

  constructor() {
    super();
    this.#route.params.subscribe(params => {
      this.systemId = +params['id'];
      this.subsystemId = +params['subsystemId'];
    });
  }

  submit() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.store.addPart(new HvofPart({ id: 0, hvofSubsystemId: this.subsystemId, partType: v.partType, serialNumber: v.serialNumber, manufacturer: v.manufacturer }));
    this.back();
  }

  back() {
    this.#router.navigate(['equipment/hvof-systems', this.systemId]).then();
  }
}
