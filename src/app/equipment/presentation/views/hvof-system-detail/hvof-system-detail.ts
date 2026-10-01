import {Component, computed, inject} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {MatTabsModule} from '@angular/material/tabs';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';
import {TranslatePipe} from '@ngx-translate/core';
import {EquipmentStore} from '../../../application/equipment.store';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelActionRow, MatExpansionPanelDescription,
  MatExpansionPanelHeader, MatExpansionPanelTitle
} from '@angular/material/expansion';
import {MatExpansionModule} from '@angular/material/expansion';

@Component({
  selector: 'app-hvof-system-detail',
  imports: [MatTabsModule, MatTableModule, MatButtonModule, MatIconModule, MatChipsModule, TranslatePipe, MatExpansionPanelActionRow, MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription],
  templateUrl: './hvof-system-detail.html',
  styleUrl: './hvof-system-detail.css'
})
export class HvofSystemDetail {
  readonly store = inject(EquipmentStore);
  #route = inject(ActivatedRoute);
  #router = inject(Router);

  readonly systemId = toSignal(this.#route.params.pipe(map(p => +p['id'])), {initialValue: 0});
  readonly system = computed(() => this.store.getHvofSystemById(this.systemId())());
  readonly controllers = computed(() => this.store.controllersOf(this.systemId())());
  readonly subsystems = computed(() => this.store.subsystemsOf(this.systemId())());

  controllerColumns = ['controllerNumber', 'deviceType', 'manufacturer', 'model', 'ipAddress', 'protocols', 'actions'];
  partColumns = ['partType', 'serialNumber', 'manufacturer', 'actions'];


  back() {
    this.#router.navigate(['equipment/hvof-systems']).then();
  }

  newController() {
    this.#router.navigate(['equipment/hvof-systems', this.systemId(), 'controllers', 'new']).then();
  }

  editController(controllerId: number) {
    this.#router.navigate(['equipment/hvof-systems', this.systemId(), 'controllers', controllerId, 'edit']).then();
  }

  partsOf(subsystemId: number) {
    return this.store.partsOf(subsystemId)();
  }

  newSubsystem() {
    this.#router.navigate(['equipment/hvof-systems', this.systemId(), 'subsystems', 'new']).then();
  }

  editSubsystem(subsystemId: number) {
    this.#router.navigate(['equipment/hvof-systems', this.systemId(), 'subsystems', subsystemId, 'edit']).then();
  }

  newPart(subsystemId: number) {
    this.#router.navigate(['equipment/hvof-systems', this.systemId(), 'subsystems', subsystemId, 'parts', 'new']).then();
  }

  deletePart(partId: number) {
    this.store.deletePart(partId);
  }
}
