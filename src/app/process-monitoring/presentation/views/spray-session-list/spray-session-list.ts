import {Component, computed, inject, viewChild} from '@angular/core';
import {Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import {MatError} from '@angular/material/form-field';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {TranslatePipe} from '@ngx-translate/core';
import {ProcessMonitoringStore} from '../../../application/process-monitoring.store';
import {EquipmentStore} from '../../../../equipment/application/equipment.store';
import {TraceabilityStore} from '../../../../traceability/application/traceability.store';

@Component({
  selector: 'app-spray-session-list',
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatChipsModule, MatError, MatProgressSpinner, MatPaginator, MatSort, MatSortHeader, TranslatePipe, DatePipe],
  templateUrl: './spray-session-list.html',
  styleUrl: './spray-session-list.css'
})
export class SpraySessionList {
  readonly store = inject(ProcessMonitoringStore);
  readonly equipment = inject(EquipmentStore);
  readonly traceability = inject(TraceabilityStore);
  protected router = inject(Router);

  displayedColumns: string[] = ['id', 'startedAt', 'hvofSystem', 'recuperation', 'recipeNumber', 'status', 'actions'];
  readonly sort = viewChild(MatSort);
  readonly paginator = viewChild(MatPaginator);

  readonly dataSource = computed(() => {
    const source = new MatTableDataSource(this.store.sessions());
    const sort = this.sort();
    if (sort) {
      source.sort = sort;
    }
    const paginator = this.paginator();
    if (paginator) {
      source.paginator = paginator;
    }
    return source;
  });

  systemCode(id: number): string {
    return this.equipment.getHvofSystemById(id)()?.code ?? `#${id}`;
  }

  workOrder(id: number): string {
    return this.traceability.getRecuperationById(id)()?.workOrderNumber ?? `#${id}`;
  }

  startSession() {
    this.router.navigate(['process-monitoring/spray-sessions/new']).then();
  }

  openSession(id: number) {
    this.router.navigate(['process-monitoring/spray-sessions', id]).then();
  }
}
