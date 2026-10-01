import {BaseEntity} from '../../../shared/domain/model/base-entity';

export type PartType = 'MASS_FLOW_CONTROLLER' | 'HOPPER' | 'CARRIER_GAS_MFC' | 'COOLANT_PUMP' | 'TEMPERATURE_SENSOR' | 'SPINDLE_VFD' | 'AXIS_DRIVE' | 'NOZZLE';

export class HvofPart implements BaseEntity {
  #id: number;
  #hvofSubsystemId: number;
  #partType: PartType;
  #serialNumber: string;
  #manufacturer: string;

  constructor(props: { id: number; hvofSubsystemId: number; partType: PartType; serialNumber: string; manufacturer: string }) {
    this.#id = props.id;
    this.#hvofSubsystemId = props.hvofSubsystemId;
    this.#partType = props.partType;
    this.#serialNumber = props.serialNumber;
    this.#manufacturer = props.manufacturer;
  }

  get id(): number { return this.#id; }
  set id(value: number) { this.#id = value; }
  get hvofSubsystemId(): number { return this.#hvofSubsystemId; }
  set hvofSubsystemId(value: number) { this.#hvofSubsystemId = value; }
  get partType(): PartType { return this.#partType; }
  set partType(value: PartType) { this.#partType = value; }
  get serialNumber(): string { return this.#serialNumber; }
  set serialNumber(value: string) { this.#serialNumber = value; }
  get manufacturer(): string { return this.#manufacturer; }
  set manufacturer(value: string) { this.#manufacturer = value; }
}
