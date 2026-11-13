import {Component, computed, inject, signal, viewChild} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {DatePipe, DecimalPipe} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule, MatError} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {TranslatePipe} from '@ngx-translate/core';
import {FaultDiagnosisStore} from '../../../application/fault-diagnosis.store';
import {EquipmentStore} from '../../../../equipment/application/equipment.store';
import {FaultCaseStatus} from '../../../domain/model/fault-case.entity';

@Component({
  selector: 'app-fault-case-list',
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule, MatError, MatProgressSpinner, MatPaginator, MatSort, MatSortHeader, TranslatePipe, DatePipe, DecimalPipe, FormsModule, RouterLink],
  templateUrl: './fault-case-list.html',
  styleUrl: './fault-case-list.css'
})
export class FaultCaseList {
  readonly store = inject(FaultDiagnosisStore);
  readonly equipment = inject(EquipmentStore);
  readonly #router = inject(Router);
  readonly #route = inject(ActivatedRoute);

  readonly displayedColumns = ['detectedAt', 'session', 'parameter', 'band', 'value', 'status', 'actions'];
  readonly sort = viewChild(MatSort);
  readonly paginator = viewChild(MatPaginator);

  readonly sessionFilter = toSignal(this.#route.queryParams.pipe(map(p => p['spraySessionId'] ? +p['spraySessionId'] : null)), {initialValue: null});
  readonly statusFilter = signal<FaultCaseStatus | 'all'>('all');
  readonly statuses: FaultCaseStatus[] = ['open', 'acknowledged', 'resolved'];

  readonly filtered = computed(() => this.store.faultCases().filter(c =>
    (!this.sessionFilter() || c.spraySessionId === this.sessionFilter()) &&
    (this.statusFilter() === 'all' || c.status === this.statusFilter())));

  readonly dataSource = computed(() => {
    const source = new MatTableDataSource(this.filtered());
    source.sortingDataAccessor = (c, property) => property === 'detectedAt' ? c.epochMillis : (c as unknown as Record<string, string | number>)[property];
    const sort = this.sort();
    if (sort) source.sort = sort;
    const paginator = this.paginator();
    if (paginator) source.paginator = paginator;
    return source;
  });

  constructor() {
    this.store.loadFaultCases();
  }

  systemCode(id: number): string {
    return this.equipment.getHvofSystemById(id)()?.code ?? `#${id}`;
  }

  clearSession() {
    this.#router.navigate(['fault-diagnosis/fault-cases']).then();
  }

  open(id: number) {
    this.#router.navigate(['fault-diagnosis/fault-cases', id]).then();
  }

  acknowledge(id: number) {
    this.store.acknowledge(id);
  }
}
