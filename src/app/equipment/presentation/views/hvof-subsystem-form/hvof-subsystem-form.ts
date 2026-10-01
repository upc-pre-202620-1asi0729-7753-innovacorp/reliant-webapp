import {Component, inject, signal} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {HvofSubsystem, SubsystemType} from '../../../domain/model/hvof-subsystem.entity';
import {EquipmentStore} from '../../../application/equipment.store';

@Component({
  selector: 'app-hvof-subsystem-form',
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, MatChipsModule, MatIconModule, MatButtonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './hvof-subsystem-form.html',
  styleUrl: './hvof-subsystem-form.css'
})
export class HvofSubsystemForm extends BaseForm {
  #fb = inject(FormBuilder);
  #route = inject(ActivatedRoute);
  #router = inject(Router);
  readonly store = inject(EquipmentStore);

  readonly subsystemTypes: SubsystemType[] = ['GAS_CONSOLE', 'POWDER_FEEDER', 'COOLING_UNIT', 'MANIPULATOR', 'DUST_COLLECTOR', 'SPRAY_GUN'];
  readonly separatorKeys = [ENTER, COMMA];
  readonly parameters = signal<string[]>([]);

  form = this.#fb.group({
    subsystemType: new FormControl<SubsystemType>('GAS_CONSOLE', { nonNullable: true, validators: [Validators.required] }),
    name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    alias: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] })
  });

  systemId = 0;
  subsystemId: number | null = null;
  isEdit = false;

  constructor() {
    super();
    this.#route.params.subscribe(params => {
      this.systemId = +params['id'];
      this.subsystemId = params['subsystemId'] ? +params['subsystemId'] : null;
      this.isEdit = !!this.subsystemId;
      if (this.isEdit && this.subsystemId) {
        const s = this.store.getSubsystemById(this.subsystemId)();
        if (s) {
          this.form.patchValue({ subsystemType: s.subsystemType, name: s.name, alias: s.alias });
          this.parameters.set(s.parameters.map(p => p.parameter));
        }
      }
    });
  }

  addParameter(event: MatChipInputEvent) {
    const value = (event.value || '').trim().toLowerCase().replace(/\s+/g, '_');
    if (value && !this.parameters().includes(value)) {
      this.parameters.update(list => [...list, value]);
    }
    event.chipInput!.clear();
  }

  removeParameter(value: string) {
    this.parameters.update(list => list.filter(p => p !== value));
  }

  submit() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const subsystem = new HvofSubsystem({
      id: this.subsystemId ?? 0,
      hvofSystemId: this.systemId,
      subsystemType: v.subsystemType,
      name: v.name,
      alias: v.alias,
      parameters: this.parameters().map(parameter => ({parameter}))
    });
    if (this.isEdit) {
      this.store.updateSubsystem(subsystem);
    } else {
      this.store.addSubsystem(subsystem);
    }
    this.back();
  }

  back() {
    this.#router.navigate(['equipment/hvof-systems', this.systemId]).then();
  }
}
