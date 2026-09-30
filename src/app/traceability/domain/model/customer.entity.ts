import {BaseEntity} from '../../../shared/domain/model/base-entity';

export class Customer implements BaseEntity {
  #id: number;
  #supplierOrganizationId: number;
  #linkedAssetOwnerOrganizationId: number | null;
  #legalName: string;
  #ruc: string;
  #mineSite: string;

  constructor(props: {
    id: number;
    supplierOrganizationId: number;
    linkedAssetOwnerOrganizationId: number | null;
    legalName: string;
    ruc: string;
    mineSite: string;
  }) {
    this.#id = props.id;
    this.#supplierOrganizationId = props.supplierOrganizationId;
    this.#linkedAssetOwnerOrganizationId = props.linkedAssetOwnerOrganizationId;
    this.#legalName = props.legalName;
    this.#ruc = props.ruc;
    this.#mineSite = props.mineSite;
  }

  get id(): number { return this.#id; }
  set id(value: number) { this.#id = value; }

  get supplierOrganizationId(): number { return this.#supplierOrganizationId; }
  set supplierOrganizationId(value: number) { this.#supplierOrganizationId = value; }

  get linkedAssetOwnerOrganizationId(): number | null { return this.#linkedAssetOwnerOrganizationId; }
  set linkedAssetOwnerOrganizationId(value: number | null) { this.#linkedAssetOwnerOrganizationId = value; }

  get legalName(): string { return this.#legalName; }
  set legalName(value: string) { this.#legalName = value; }

  get ruc(): string { return this.#ruc; }
  set ruc(value: string) { this.#ruc = value; }

  get mineSite(): string { return this.#mineSite; }
  set mineSite(value: string) { this.#mineSite = value; }
}
