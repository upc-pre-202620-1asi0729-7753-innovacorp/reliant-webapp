import {BaseEntity} from '../../../shared/domain/model/base-entity';

export type HvofSystemStatus = 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
export type FuelType = 'HYDROGEN' | 'PROPANE' | 'KEROSENE' | 'NATURAL_GAS';

export interface TagMapping {
  tagPath: string;
  controllerId: number;
  subsystemId: number | null;
  partId: number | null;
  parameter: string | null;
  tagKind: 'ACTUAL' | 'SETPOINT' | 'STATUS' | 'FAULT';
  statusRole: string | null;
  matchedRuleId: number | null;
  confirmed: boolean;
}

export class HvofSystem implements BaseEntity {
  #id: number;
  #code: string;
  #organizationId: number;
  #serialNumber: string;
  #status: HvofSystemStatus;
  #systemManufacturer: string;
  #systemModel: string;
  #fuelType: FuelType;
  #tagMappings: TagMapping[];

  constructor(props: {
    id: number; code: string; organizationId: number; serialNumber: string; status: HvofSystemStatus;
    systemManufacturer: string; systemModel: string; fuelType: FuelType; tagMappings: TagMapping[];
  }) {
    this.#id = props.id;
    this.#code = props.code;
    this.#organizationId = props.organizationId;
    this.#serialNumber = props.serialNumber;
    this.#status = props.status;
    this.#systemManufacturer = props.systemManufacturer;
    this.#systemModel = props.systemModel;
    this.#fuelType = props.fuelType;
    this.#tagMappings = props.tagMappings;
  }

  get id(): number { return this.#id; }
  set id(value: number) { this.#id = value; }
  get code(): string { return this.#code; }
  set code(value: string) { this.#code = value; }
  get organizationId(): number { return this.#organizationId; }
  set organizationId(value: number) { this.#organizationId = value; }
  get serialNumber(): string { return this.#serialNumber; }
  set serialNumber(value: string) { this.#serialNumber = value; }
  get status(): HvofSystemStatus { return this.#status; }
  set status(value: HvofSystemStatus) { this.#status = value; }
  get systemManufacturer(): string { return this.#systemManufacturer; }
  set systemManufacturer(value: string) { this.#systemManufacturer = value; }
  get systemModel(): string { return this.#systemModel; }
  set systemModel(value: string) { this.#systemModel = value; }
  get fuelType(): FuelType { return this.#fuelType; }
  set fuelType(value: FuelType) { this.#fuelType = value; }
  get tagMappings(): TagMapping[] { return this.#tagMappings; }
  set tagMappings(value: TagMapping[]) { this.#tagMappings = value; }
}
