import {Component, computed, effect, inject, signal, viewChild} from '@angular/core';
import {Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule, MatError} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {TranslatePipe} from '@ngx-translate/core';
import {ProcessMonitoringStore} from '../../../application/process-monitoring.store';
import {EquipmentStore} from '../../../../equipment/application/equipment.store';
import {TraceabilityStore} from '../../../../traceability/application/traceability.store';
import {MatInputModule} from '@angular/material/input';

@Component({
  selector: 'app-spray-session-list',
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatChipsModule, MatFormFieldModule, MatSelectModule, MatDatepickerModule, MatInputModule,
    MatError, MatProgressSpinner, MatPaginator, MatSort, MatSortHeader, TranslatePipe, DatePipe, FormsModule],
  providers: [provideNativeDateAdapter()],
  templateUrl: './spray-session-list.html',
  styleUrl: './spray-session-list.css'
})
export class SpraySessionList {
  readonly store = inject(ProcessMonitoringStore);
  readonly equipment = inject(EquipmentStore);
  readonly traceability = inject(TraceabilityStore);
  protected router = inject(Router);

  displayedColumns: string[] = ['id', 'startedAt', 'hvofSystem', 'recuperation', 'recipeNumber', 'status', 'deviations', 'actions'];
  readonly sort = viewChild(MatSort);
  readonly paginator = viewChild(MatPaginator);

  readonly filterSystemId = signal<number | null>(null);
  readonly filterRecuperationId = signal<number | null>(null);
  readonly filterFrom = signal<Date | null>(null);
  readonly filterTo = signal<Date | null>(null);

  readonly filtered = computed(() => {
    const from = this.filterFrom();
    const to = this.filterTo();
    return this.store.sessions().filter(s => {
      if (this.filterSystemId() && s.hvofSystemId !== this.filterSystemId()) return false;
      if (this.filterRecuperationId() && s.recuperationId !== this.filterRecuperationId()) return false;
      const started = new Date(s.startedAt);
      if (from && started < from) return false;
      if (to) {
        const end = new Date(to);
        end.setHours(23, 59, 59, 999);
        if (started > end) return false;
      }
      return true;
    });
  });

  readonly dataSource = computed(() => {
    const source = new MatTableDataSource(this.filtered());
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

  constructor() {
    effect(() => this.filtered().forEach(s => this.store.loadDeviations(s.id)));
  }

  deviationsOf(sessionId: number): string {
    const n = this.store.deviations().get(sessionId);
    return n === undefined ? '…' : n < 0 ? '–' : String(n);
  }

  clearFilters() {
    this.filterSystemId.set(null);
    this.filterRecuperationId.set(null);
    this.filterFrom.set(null);
    this.filterTo.set(null);
  }

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
