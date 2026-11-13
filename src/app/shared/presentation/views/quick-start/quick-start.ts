import {Component, computed, inject} from '@angular/core';
import {Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {TranslatePipe} from '@ngx-translate/core';
import {QuickStartService} from '../../../application/quick-start.service';
import {EquipmentStore} from '../../../../equipment/application/equipment.store';
import {TraceabilityStore} from '../../../../traceability/application/traceability.store';
import {IamStore, ROLE} from '../../../../iam/application/iam.store';
import {DEMO_PLANT, QUICK_START_STEPS} from '../../../domain/model/demo-plant';

/**
 * Guided start for a new organization: a checklist of what the plant needs and a one-click demo provisioning.
 */
@Component({
  selector: 'app-quick-start',
  imports: [MatButtonModule, MatIconModule, MatProgressSpinner, TranslatePipe],
  templateUrl: './quick-start.html',
  styleUrl: './quick-start.css'
})
export class QuickStart {
  readonly service = inject(QuickStartService);
  readonly equipment = inject(EquipmentStore);
  readonly traceability = inject(TraceabilityStore);
  readonly iam = inject(IamStore);
  readonly #router = inject(Router);

  readonly steps = QUICK_START_STEPS;
  readonly plant = DEMO_PLANT;
  readonly canProvision = computed(() => this.iam.hasRole(ROLE.ORG_ADMIN, ROLE.QUALITY_ENGINEER, ROLE.MAINTENANCE_SUPERVISOR, ROLE.OPERATIONS_SUPERVISOR));

  readonly checklist = computed(() => [
    {key: 'system', done: this.equipment.hvofSystems().length > 0, link: '/equipment/hvof-systems'},
    {key: 'subsystems', done: this.equipment.subsystems().length > 0, link: '/equipment/hvof-systems'},
    {key: 'recipe', done: this.equipment.recipes().some(r => r.status === 'ACTIVE'), link: '/equipment/hvof-systems'},
    {key: 'customer', done: this.traceability.customers().length > 0, link: '/traceability/customers'},
    {key: 'component', done: this.traceability.components().length > 0, link: '/traceability/components'},
    {key: 'recuperation', done: this.traceability.openRecuperations().length > 0, link: '/traceability/recuperations'}
  ]);
  readonly completed = computed(() => this.checklist().filter(c => c.done).length);

  stepIcon(state: string): string {
    switch (state) {
      case 'done': return 'check_circle';
      case 'reused': return 'history';
      case 'running': return 'autorenew';
      case 'failed': return 'error';
      default: return 'radio_button_unchecked';
    }
  }

  run() {
    this.service.run();
  }

  openSession() {
    const id = this.service.sessionId();
    if (id) this.#router.navigate(['process-monitoring/spray-sessions', id]).then();
  }

  go(link: string) {
    this.#router.navigate([link]).then();
  }
}
