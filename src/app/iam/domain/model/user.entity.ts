import {BaseEntity} from '../../../shared/domain/model/base-entity';

export class User implements BaseEntity {
  #id: number;
  #fullName: string;
  #email: string;
  #organizationId: number;
  #status: string;
  #roleIds: { roleId: number }[];

  constructor(props: { id: number; fullName: string; email: string; organizationId: number; status: string; roleIds: { roleId: number }[] }) {
    this.#id = props.id;
    this.#fullName = props.fullName;
    this.#email = props.email;
    this.#organizationId = props.organizationId;
    this.#status = props.status;
    this.#roleIds = props.roleIds;
  }

  get id(): number { return this.#id; }
  set id(value: number) { this.#id = value; }
  get fullName(): string { return this.#fullName; }
  set fullName(value: string) { this.#fullName = value; }
  get email(): string { return this.#email; }
  set email(value: string) { this.#email = value; }
  get organizationId(): number { return this.#organizationId; }
  set organizationId(value: number) { this.#organizationId = value; }
  get status(): string { return this.#status; }
  set status(value: string) { this.#status = value; }
  get roleIds(): { roleId: number }[] { return this.#roleIds; }
  set roleIds(value: { roleId: number }[]) { this.#roleIds = value; }

  hasRole(roleId: number): boolean {
    return this.#roleIds.some(r => r.roleId === roleId);
  }
}
