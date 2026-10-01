import {BaseEntity} from '../../../shared/domain/model/base-entity';

export type DeviceType = 'PLC' | 'OPC_UA_SERVER' | 'GATEWAY';
export type Protocol = 'ETHERNET_IP' | 'OPC_UA' | 'MODBUS_TCP' | 'S7';

export class Controller implements BaseEntity {
  #id: number;
  #hvofSystemId: number;
  #controllerNumber: number;
  #deviceType: DeviceType;
  #serialNumber: string;
  #manufacturer: string;
  #model: string;
  #partNumber: string;
  #ipAddress: string;
  #port: number;
  #rack: number;
  #slot: number;
  #endpointUrl: string | null;
  #tagCatalogId: number | null;
  #supportedProtocols: { protocol: Protocol }[];

  constructor(props: {
    id: number; hvofSystemId: number; controllerNumber: number; deviceType: DeviceType; serialNumber: string;
    manufacturer: string; model: string; partNumber: string; ipAddress: string; port: number; rack: number; slot: number;
    endpointUrl: string | null; tagCatalogId: number | null; supportedProtocols: { protocol: Protocol }[];
  }) {
    this.#id = props.id;
    this.#hvofSystemId = props.hvofSystemId;
    this.#controllerNumber = props.controllerNumber;
    this.#deviceType = props.deviceType;
    this.#serialNumber = props.serialNumber;
    this.#manufacturer = props.manufacturer;
    this.#model = props.model;
    this.#partNumber = props.partNumber;
    this.#ipAddress = props.ipAddress;
    this.#port = props.port;
    this.#rack = props.rack;
    this.#slot = props.slot;
    this.#endpointUrl = props.endpointUrl;
    this.#tagCatalogId = props.tagCatalogId;
    this.#supportedProtocols = props.supportedProtocols;
  }

  get id(): number { return this.#id; }
  set id(value: number) { this.#id = value; }
  get hvofSystemId(): number { return this.#hvofSystemId; }
  set hvofSystemId(value: number) { this.#hvofSystemId = value; }
  get controllerNumber(): number { return this.#controllerNumber; }
  set controllerNumber(value: number) { this.#controllerNumber = value; }
  get deviceType(): DeviceType { return this.#deviceType; }
  set deviceType(value: DeviceType) { this.#deviceType = value; }
  get serialNumber(): string { return this.#serialNumber; }
  set serialNumber(value: string) { this.#serialNumber = value; }
  get manufacturer(): string { return this.#manufacturer; }
  set manufacturer(value: string) { this.#manufacturer = value; }
  get model(): string { return this.#model; }
  set model(value: string) { this.#model = value; }
  get partNumber(): string { return this.#partNumber; }
  set partNumber(value: string) { this.#partNumber = value; }
  get ipAddress(): string { return this.#ipAddress; }
  set ipAddress(value: string) { this.#ipAddress = value; }
  get port(): number { return this.#port; }
  set port(value: number) { this.#port = value; }
  get rack(): number { return this.#rack; }
  set rack(value: number) { this.#rack = value; }
  get slot(): number { return this.#slot; }
  set slot(value: number) { this.#slot = value; }
  get endpointUrl(): string | null { return this.#endpointUrl; }
  set endpointUrl(value: string | null) { this.#endpointUrl = value; }
  get tagCatalogId(): number | null { return this.#tagCatalogId; }
  set tagCatalogId(value: number | null) { this.#tagCatalogId = value; }
  get supportedProtocols(): { protocol: Protocol }[] { return this.#supportedProtocols; }
  set supportedProtocols(value: { protocol: Protocol }[]) { this.#supportedProtocols = value; }
}
