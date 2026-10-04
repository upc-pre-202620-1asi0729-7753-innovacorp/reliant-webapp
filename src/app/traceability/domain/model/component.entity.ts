import {BaseEntity} from '../../../shared/domain/model/base-entity';

export type ComponentType = 'HYDRAULIC_ROD' | 'CYLINDER_BLOCK' | 'SHAFT' | 'IMPELLER' | 'OTHER';
export type ComponentStatus = 'RECEIVED' | 'IN_RECUPERATION' | 'IN_SERVICE' | 'RETURNED' | 'SCRAPPED';

export class RecoveredComponent implements BaseEntity {
  #id: number;
  #serialNumber: string;
  #partNumber: string;
  #componentType: ComponentType;
  #machineManufacturer: string;
  #machineModel: string;
  #customerId: number;
  #pcrTargetHours: number;
  #status: ComponentStatus;

  constructor(props: {
    id: number;
    serialNumber: string;
    partNumber: string;
    componentType: ComponentType;
    machineManufacturer: string;
    machineModel: string;
    customerId: number;
    pcrTargetHours: number;
    status: ComponentStatus;
  }) {
    this.#id = props.id;
    this.#serialNumber = props.serialNumber;
    this.#partNumber = props.partNumber;
    this.#componentType = props.componentType;
    this.#machineManufacturer = props.machineManufacturer;
    this.#machineModel = props.machineModel;
    this.#customerId = props.customerId;
    this.#pcrTargetHours = props.pcrTargetHours;
    this.#status = props.status;
  }

  get id(): number { return this.#id; }
  set id(value: number) { this.#id = value; }

  get serialNumber(): string { return this.#serialNumber; }
  set serialNumber(value: string) { this.#serialNumber = value; }

  get partNumber(): string { return this.#partNumber; }
  set partNumber(value: string) { this.#partNumber = value; }

  get componentType(): ComponentType { return this.#componentType; }
  set componentType(value: ComponentType) { this.#componentType = value; }

  get machineManufacturer(): string { return this.#machineManufacturer; }
  set machineManufacturer(value: string) { this.#machineManufacturer = value; }

  get machineModel(): string { return this.#machineModel; }
  set machineModel(value: string) { this.#machineModel = value; }

  get customerId(): number { return this.#customerId; }
  set customerId(value: number) { this.#customerId = value; }

  get pcrTargetHours(): number { return this.#pcrTargetHours; }
  set pcrTargetHours(value: number) { this.#pcrTargetHours = value; }

  get status(): ComponentStatus { return this.#status; }
  set status(value: ComponentStatus) { this.#status = value; }
}
