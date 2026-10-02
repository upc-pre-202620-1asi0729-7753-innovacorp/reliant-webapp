import {Component, computed, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {SpraySession} from '../../../domain/model/spray-session.entity';
import {ProcessMonitoringStore} from '../../../application/process-monitoring.store';
import {EquipmentStore} from '../../../../equipment/application/equipment.store';
import {TraceabilityStore} from '../../../../traceability/application/traceability.store';

@Component({
  selector: 'app-spray-session-start',
  imports: [MatFormFieldModule, MatSelectModule, MatButtonModule, MatIconModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './spray-session-start.html',
  styleUrl: './spray-session-start.css'
})
export class SpraySessionStart extends BaseForm {
  #fb = inject(FormBuilder);
  #router = inject(Router);
  readonly store = inject(ProcessMonitoringStore);
  readonly equipment = inject(EquipmentStore);
  readonly traceability = inject(TraceabilityStore);

  form = this.#fb.group({
    hvofSystemId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    recuperationId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    recipeNumber: new FormControl<number | null>({ value: null, disabled: true }, { validators: [Validators.required] })
  });

  readonly selectedSystemId = toSignal(this.form.controls.hvofSystemId.valueChanges, { initialValue: null });

  readonly openRecuperations = computed(() =>
    this.traceability.recuperations().filter(r => ['RECEIVED', 'IN_PROGRESS', 'REWORK'].includes(r.status)));

  readonly activeRecipes = computed(() => {
    const systemId = this.selectedSystemId();
    return systemId ? this.equipment.activeRecipesOf(systemId)() : [];
  });

  constructor() {
    super();
    this.form.controls.hvofSystemId.valueChanges.subscribe(systemId => {
      const recipe = this.form.controls.recipeNumber;
      recipe.reset();
      systemId ? recipe.enable() : recipe.disable();
    });
  }

  submit() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const session = new SpraySession({
      id: 0,
      hvofSystemId: v.hvofSystemId!,
      recuperationId: v.recuperationId!,
      operatorId: 4,
      recipeNumber: v.recipeNumber!,
      startedAt: new Date().toISOString(),
      endedAt: null,
      timeZone: 'America/Lima',
      status: 'active'
    });
    this.store.startSession(session, created => {
      const recuperation = this.traceability.getRecuperationById(created.recuperationId)();
      if (recuperation) {
        recuperation.status = 'IN_PROGRESS';
        recuperation.linkedSessions = [...recuperation.linkedSessions, {sessionId: created.id}];
        this.traceability.updateRecuperation(recuperation);
      }
      this.#router.navigate(['process-monitoring/spray-sessions', created.id]).then();
    });
  }

  cancel() {
    this.#router.navigate(['process-monitoring/spray-sessions']).then();
  }
}
