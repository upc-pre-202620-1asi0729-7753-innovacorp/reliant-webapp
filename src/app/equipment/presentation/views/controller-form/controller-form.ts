import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {Controller, DeviceType, Protocol} from '../../../domain/model/controller.entity';
import {EquipmentStore} from '../../../application/equipment.store';

const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

@Component({
  selector: 'app-controller-form',
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './controller-form.html',
  styleUrl: './controller-form.css'
})
export class ControllerForm extends BaseForm {
  #fb = inject(FormBuilder);
  #route = inject(ActivatedRoute);
  #router = inject(Router);
  readonly store = inject(EquipmentStore);

  readonly deviceTypes: DeviceType[] = ['PLC', 'OPC_UA_SERVER', 'GATEWAY'];
  readonly protocols: Protocol[] = ['ETHERNET_IP', 'OPC_UA', 'MODBUS_TCP', 'S7'];

  form = this.#fb.group({
    deviceType: new FormControl<DeviceType>('PLC', { nonNullable: true, validators: [Validators.required] }),
    manufacturer: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    model: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    partNumber: new FormControl<string>('', { nonNullable: true }),
    serialNumber: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    ipAddress: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.pattern(IPV4)] }),
    port: new FormControl<number>(44818, { nonNullable: true, validators: [Validators.min(1), Validators.max(65535)] }),
    rack: new FormControl<number>(0, { nonNullable: true, validators: [Validators.min(0)] }),
    slot: new FormControl<number>(0, { nonNullable: true, validators: [Validators.min(0)] }),
    supportedProtocols: new FormControl<Protocol[]>(['ETHERNET_IP'], { nonNullable: true, validators: [Validators.required] })
  });

  systemId = 0;
  controllerId: number | null = null;
  isEdit = false;

  constructor() {
    super();
    this.#route.params.subscribe(params => {
      this.systemId = +params['id'];
      this.controllerId = params['controllerId'] ? +params['controllerId'] : null;
      this.isEdit = !!this.controllerId;
      if (this.isEdit && this.controllerId) {
        const c = this.store.getControllerById(this.controllerId)();
        if (c) {
          this.form.patchValue({
            deviceType: c.deviceType, manufacturer: c.manufacturer, model: c.model, partNumber: c.partNumber,
            serialNumber: c.serialNumber, ipAddress: c.ipAddress, port: c.port, rack: c.rack, slot: c.slot,
            supportedProtocols: c.supportedProtocols.map(p => p.protocol)
          });
        }
      }
    });
  }

  submit() {
    if (this.form.invalid) return;
    const existing = this.controllerId ? this.store.getControllerById(this.controllerId)() : undefined;
    const v = this.form.getRawValue();
    const nextNumber = this.store.controllersOf(this.systemId)().length + 1;
    const controller = new Controller({
      id: this.controllerId ?? 0,
      hvofSystemId: this.systemId,
      controllerNumber: existing?.controllerNumber ?? nextNumber,
      deviceType: v.deviceType,
      serialNumber: v.serialNumber,
      manufacturer: v.manufacturer,
      model: v.model,
      partNumber: v.partNumber,
      ipAddress: v.ipAddress,
      port: v.port,
      rack: v.rack,
      slot: v.slot,
      endpointUrl: existing?.endpointUrl ?? null,
      tagCatalogId: existing?.tagCatalogId ?? null,
      supportedProtocols: v.supportedProtocols.map(protocol => ({protocol}))
    });
    if (this.isEdit) {
      this.store.updateController(controller);
    } else {
      this.store.addController(controller);
    }
    this.back();
  }

  back() {
    this.#router.navigate(['equipment/hvof-systems', this.systemId]).then();
  }
}
