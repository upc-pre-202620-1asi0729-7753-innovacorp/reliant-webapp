import {BaseEntity} from '../../../shared/domain/model/base-entity';

export type RecuperationStatus = 'RECEIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELIVERED' | 'REWORK';

export interface LinkedSession {
  sessionId: number;
}

export class Recuperation implements BaseEntity {
  #id: number;
  #workOrderNumber: string;
  #manufacturingOrderNumber: string;
  #componentId: number;
  #customerId: number;
  #supplierOrganizationId: number;
  #segment: string;
  #operation: string;
  #weightValue: number;
  #weightUnitSymbol: string;
  #hourmeterAtEntry: number;
  #powderSupplier: string;
  #powderLotNumber: string;
  #powderChemicalComposition: string;
  #status: RecuperationStatus;
  #receivedAt: string;
  #completedAt: string | null;
  #linkedSessions: LinkedSession[];

  constructor(props: {
    id: number;
    workOrderNumber: string;
    manufacturingOrderNumber: string;
    componentId: number;
    customerId: number;
    supplierOrganizationId: number;
    segment: string;
    operation: string;
    weightValue: number;
    weightUnitSymbol: string;
    hourmeterAtEntry: number;
    powderSupplier: string;
    powderLotNumber: string;
    powderChemicalComposition: string;
    status: RecuperationStatus;
    receivedAt: string;
    completedAt: string | null;
    linkedSessions: LinkedSession[];
  }) {
    this.#id = props.id;
    this.#workOrderNumber = props.workOrderNumber;
    this.#manufacturingOrderNumber = props.manufacturingOrderNumber;
    this.#componentId = props.componentId;
    this.#customerId = props.customerId;
    this.#supplierOrganizationId = props.supplierOrganizationId;
    this.#segment = props.segment;
    this.#operation = props.operation;
    this.#weightValue = props.weightValue;
    this.#weightUnitSymbol = props.weightUnitSymbol;
    this.#hourmeterAtEntry = props.hourmeterAtEntry;
    this.#powderSupplier = props.powderSupplier;
    this.#powderLotNumber = props.powderLotNumber;
    this.#powderChemicalComposition = props.powderChemicalComposition;
    this.#status = props.status;
    this.#receivedAt = props.receivedAt;
    this.#completedAt = props.completedAt;
    this.#linkedSessions = props.linkedSessions;
  }

  get id(): number { return this.#id; }
  set id(value: number) { this.#id = value; }
  get workOrderNumber(): string { return this.#workOrderNumber; }
  set workOrderNumber(value: string) { this.#workOrderNumber = value; }
  get manufacturingOrderNumber(): string { return this.#manufacturingOrderNumber; }
  set manufacturingOrderNumber(value: string) { this.#manufacturingOrderNumber = value; }
  get componentId(): number { return this.#componentId; }
  set componentId(value: number) { this.#componentId = value; }
  get customerId(): number { return this.#customerId; }
  set customerId(value: number) { this.#customerId = value; }
  get supplierOrganizationId(): number { return this.#supplierOrganizationId; }
  set supplierOrganizationId(value: number) { this.#supplierOrganizationId = value; }
  get segment(): string { return this.#segment; }
  set segment(value: string) { this.#segment = value; }
  get operation(): string { return this.#operation; }
  set operation(value: string) { this.#operation = value; }
  get weightValue(): number { return this.#weightValue; }
  set weightValue(value: number) { this.#weightValue = value; }
  get weightUnitSymbol(): string { return this.#weightUnitSymbol; }
  set weightUnitSymbol(value: string) { this.#weightUnitSymbol = value; }
  get hourmeterAtEntry(): number { return this.#hourmeterAtEntry; }
  set hourmeterAtEntry(value: number) { this.#hourmeterAtEntry = value; }
  get powderSupplier(): string { return this.#powderSupplier; }
  set powderSupplier(value: string) { this.#powderSupplier = value; }
  get powderLotNumber(): string { return this.#powderLotNumber; }
  set powderLotNumber(value: string) { this.#powderLotNumber = value; }
  get powderChemicalComposition(): string { return this.#powderChemicalComposition; }
  set powderChemicalComposition(value: string) { this.#powderChemicalComposition = value; }
  get status(): RecuperationStatus { return this.#status; }
  set status(value: RecuperationStatus) { this.#status = value; }
  get receivedAt(): string { return this.#receivedAt; }
  set receivedAt(value: string) { this.#receivedAt = value; }
  get completedAt(): string | null { return this.#completedAt; }
  set completedAt(value: string | null) { this.#completedAt = value; }
  get linkedSessions(): LinkedSession[] { return this.#linkedSessions; }
  set linkedSessions(value: LinkedSession[]) { this.#linkedSessions = value; }
}
