import {BaseEntity} from '../../../shared/domain/model/base-entity';

export type OrganizationType = 'RECUPERATION_SUPPLIER' | 'ASSET_OWNER';

export class Organization implements BaseEntity {
  #id: number;
  #name: string;
  #ruc: string;
  #organizationType: OrganizationType;
  #status: string;
  #timeZone: string;

  constructor(props: { id: number; name: string; ruc: string; organizationType: OrganizationType; status: string; timeZone: string }) {
    this.#id = props.id;
    this.#name = props.name;
    this.#ruc = props.ruc;
    this.#organizationType = props.organizationType;
    this.#status = props.status;
    this.#timeZone = props.timeZone;
  }

  get id(): number { return this.#id; }
  set id(value: number) { this.#id = value; }
  get name(): string { return this.#name; }
  set name(value: string) { this.#name = value; }
  get ruc(): string { return this.#ruc; }
  set ruc(value: string) { this.#ruc = value; }
  get organizationType(): OrganizationType { return this.#organizationType; }
  set organizationType(value: OrganizationType) { this.#organizationType = value; }
  get status(): string { return this.#status; }
  set status(value: string) { this.#status = value; }
  get timeZone(): string { return this.#timeZone; }
  set timeZone(value: string) { this.#timeZone = value; }
}
