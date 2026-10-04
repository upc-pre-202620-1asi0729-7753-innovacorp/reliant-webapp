export class SignIn {}
export class SignInCommand {
  #email: string;
  #password: string;

  constructor(props: { email: string; password: string }) {
    this.#email = props.email;
    this.#password = props.password;
  }

  get email(): string { return this.#email; }
  get password(): string { return this.#password; }
}
