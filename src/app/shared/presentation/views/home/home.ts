import {Component, computed, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {IamStore} from '../../../../iam/application/iam.store';
import {ProcessMonitoringStore} from '../../../../process-monitoring/application/process-monitoring.store';
import {TraceabilityStore} from '../../../../traceability/application/traceability.store';
import {EquipmentStore} from '../../../../equipment/application/equipment.store';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatButtonModule, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  readonly iam = inject(IamStore);
  readonly monitoring = inject(ProcessMonitoringStore);
  readonly traceability = inject(TraceabilityStore);
  readonly equipment = inject(EquipmentStore);

  readonly activeSession = computed(() => this.monitoring.activeSessions()[0]);
  readonly inProgressRecuperations = computed(() => this.traceability.openRecuperations().length);
}
