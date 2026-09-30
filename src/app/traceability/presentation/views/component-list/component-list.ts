import {Component, computed, inject, viewChild} from '@angular/core';
import {Router} from '@angular/router';
import {MatTableDataSource, MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatError} from '@angular/material/form-field';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {TranslatePipe} from '@ngx-translate/core';
import {TraceabilityStore} from '../../../application/traceability.store';

@Component({
  selector: 'app-component-list',
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatError, MatProgressSpinner, MatPaginator, MatSort, MatSortHeader, TranslatePipe],
  templateUrl: './component-list.html',
  styleUrl: './component-list.css'
})
export class ComponentList {
  readonly store = inject(TraceabilityStore);
  protected router = inject(Router);
  displayedColumns: string[] = ['serialNumber', 'partNumber', 'componentType', 'machine', 'customer', 'pcrTargetHours', 'status', 'actions'];
  readonly sort = viewChild(MatSort);
  readonly paginator = viewChild(MatPaginator);

  readonly dataSource = computed(() => {
    const source = new MatTableDataSource(this.store.components());
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

  navigateToNew() {
    this.router.navigate(['traceability/components/new']).then();
  }

  editComponent(id: number) {
    this.router.navigate(['traceability/components', id, 'edit']).then();
  }
}
