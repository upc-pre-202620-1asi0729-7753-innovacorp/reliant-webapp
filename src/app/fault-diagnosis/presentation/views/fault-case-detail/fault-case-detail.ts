import {Component, computed, inject, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {DatePipe, DecimalPipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule, MatError} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';
import {FaultDiagnosisStore} from '../../../application/fault-diagnosis.store';
import {EquipmentStore} from '../../../../equipment/application/equipment.store';
import {ProcessMonitoringStore} from '../../../../process-monitoring/application/process-monitoring.store';

@Component({
  selector: 'app-fault-case-detail',
  imports: [MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatError, TranslatePipe, DatePipe, DecimalPipe, FormsModule],
  templateUrl: './fault-case-detail.html',
  styleUrl: './fault-case-detail.css'
})
export class FaultCaseDetail {
  readonly store = inject(FaultDiagnosisStore);
  readonly equipment = inject(EquipmentStore);
  readonly monitoring = inject(ProcessMonitoringStore);
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);

  readonly caseId = toSignal(this.#route.params.pipe(map(p => +p['id'])), {initialValue: 0});
  readonly faultCase = computed(() => this.store.getFaultCaseById(this.caseId())());
  readonly system = computed(() => this.faultCase() ? this.equipment.getHvofSystemById(this.faultCase()!.hvofSystemId)() : undefined);
  readonly session = computed(() => this.faultCase() ? this.monitoring.getSessionById(this.faultCase()!.spraySessionId)() : undefined);
  readonly recipeParameter = computed(() => {
    const c = this.faultCase();
    const s = this.session();
    if (!c || !s) return undefined;
    return this.equipment.recipeByNumber(s.hvofSystemId, s.recipeNumber)()?.parameterFor(c.parameter);
  });
  readonly resolutionNotes = signal('');

  back() {
    this.#router.navigate(['fault-diagnosis/fault-cases']).then();
  }

  openSession() {
    const c = this.faultCase();
    if (c) this.#router.navigate(['process-monitoring/spray-sessions', c.spraySessionId]).then();
  }

  acknowledge() {
    this.store.acknowledge(this.caseId());
  }

  resolve() {
    this.store.resolve(this.caseId(), this.resolutionNotes().trim());
  }
}
