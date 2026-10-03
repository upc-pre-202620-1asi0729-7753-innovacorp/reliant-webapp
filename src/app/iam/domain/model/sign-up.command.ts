import {OrganizationType} from './organization.entity';

export class SignUpCommand {
  #organizationName: string;
  #ruc: string;
  #organizationType: OrganizationType;
  #fullName: string;
  #email: string;
  #password: string;

  constructor(props: { organizationName: string; ruc: string; organizationType: OrganizationType; fullName: string; email: string; password: string }) {
    this.#organizationName = props.organizationName;
    this.#ruc = props.ruc;
    this.#organizationType = props.organizationType;
    this.#fullName = props.fullName;
    this.#email = props.email;
    this.#password = props.password;
  }

  get organizationName(): string { return this.#organizationName; }
  get ruc(): string { return this.#ruc; }
  get organizationType(): OrganizationType { return this.#organizationType; }
  get fullName(): string { return this.#fullName; }
  get email(): string { return this.#email; }
  get password(): string { return this.#password; }
}
