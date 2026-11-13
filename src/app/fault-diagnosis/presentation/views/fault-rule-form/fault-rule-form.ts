import {Component, computed, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {FaultDiagnosisStore} from '../../../application/fault-diagnosis.store';
import {EquipmentStore} from '../../../../equipment/application/equipment.store';
import {IamStore} from '../../../../iam/application/iam.store';
import {FaultRule} from '../../../domain/model/fault-rule.entity';
import {FaultBand} from '../../../domain/model/fault-case.entity';

const KNOWN_PARAMETERS = ['fuel_gas_flow', 'oxygen_flow', 'powder_feed_rate', 'fuel_gas_pressure', 'oxygen_pressure', 'coolant_outlet_temp', 'coolant_flow', 'spray_distance'];

@Component({
  selector: 'app-fault-rule-form',
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './fault-rule-form.html',
  styleUrl: './fault-rule-form.css'
})
export class FaultRuleForm extends BaseForm {
  #fb = inject(FormBuilder);
  #route = inject(ActivatedRoute);
  #router = inject(Router);
  readonly store = inject(FaultDiagnosisStore);
  readonly equipment = inject(EquipmentStore);
  readonly iam = inject(IamStore);

  readonly bands: FaultBand[] = ['warning', 'shutdown'];
  /** Parameters known to the recipes of the organization plus the standard HVOF ones. */
  readonly parameters = computed(() => [...new Set([...KNOWN_PARAMETERS, ...this.equipment.recipes().flatMap(r => r.parameters.map(p => p.parameter))])].sort());

  form = this.#fb.group({
    parameter: new FormControl<string>('', {nonNullable: true, validators: [Validators.required, Validators.pattern(/^[a-z][a-z0-9_]{2,39}$/)]}),
    band: new FormControl<FaultBand>('warning', {nonNullable: true, validators: [Validators.required]}),
    probableCause: new FormControl<string>('', {nonNullable: true, validators: [Validators.required, Validators.maxLength(300)]}),
    recommendedAction: new FormControl<string>('', {nonNullable: true, validators: [Validators.required, Validators.maxLength(300)]}),
    cooldownSeconds: new FormControl<number>(60, {nonNullable: true, validators: [Validators.required, Validators.min(0), Validators.max(3600)]})
  });

  isEdit = false;
  ruleId: number | null = null;

  constructor() {
    super();
    this.#route.params.subscribe(params => {
      this.ruleId = params['id'] ? +params['id'] : null;
      this.isEdit = !!this.ruleId;
      if (this.isEdit) {
        const rule = this.store.getFaultRuleById(this.ruleId!)();
        if (rule) {
          this.form.patchValue({parameter: rule.parameter, band: rule.band, probableCause: rule.probableCause, recommendedAction: rule.recommendedAction, cooldownSeconds: rule.cooldownSeconds});
          this.form.controls.parameter.disable();
          this.form.controls.band.disable();
        }
      }
    });
  }

  submit() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const rule = new FaultRule({
      id: this.ruleId ?? 0, organizationId: this.iam.organizationId()!, parameter: v.parameter, band: v.band,
      probableCause: v.probableCause, recommendedAction: v.recommendedAction, cooldownSeconds: v.cooldownSeconds
    });
    if (this.isEdit) this.store.updateFaultRule(rule);
    else this.store.addFaultRule(rule);
    this.cancel();
  }

  cancel() {
    this.#router.navigate(['fault-diagnosis/fault-rules']).then();
  }
}
