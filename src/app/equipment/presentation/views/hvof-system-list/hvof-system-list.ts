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
import {EquipmentStore} from '../../../application/equipment.store';

@Component({
  selector: 'app-hvof-system-list',
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatError, MatProgressSpinner, MatPaginator, MatSort, MatSortHeader, TranslatePipe],
  templateUrl: './hvof-system-list.html',
  styleUrl: './hvof-system-list.css'
})
export class HvofSystemList {
  readonly store = inject(EquipmentStore);
  protected router = inject(Router);
  displayedColumns: string[] = ['code', 'systemManufacturer', 'systemModel', 'fuelType', 'status', 'actions'];
  readonly sort = viewChild(MatSort);
  readonly paginator = viewChild(MatPaginator);

  readonly dataSource = computed(() => {
    const source = new MatTableDataSource(this.store.hvofSystems());
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
    this.router.navigate(['equipment/hvof-systems/new']).then();
  }

  viewSystem(id: number) {
    this.router.navigate(['equipment/hvof-systems', id]).then();
  }

  editSystem(id: number) {
    this.router.navigate(['equipment/hvof-systems', id, 'edit']).then();
  }
}
