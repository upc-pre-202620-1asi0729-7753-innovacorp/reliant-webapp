import {BaseEntity} from '../../../shared/domain/model/base-entity';

export type SubsystemType = 'GAS_CONSOLE' | 'POWDER_FEEDER' | 'COOLING_UNIT' | 'MANIPULATOR' | 'DUST_COLLECTOR' | 'SPRAY_GUN';

export class HvofSubsystem implements BaseEntity {
  #id: number;
  #hvofSystemId: number;
  #subsystemType: SubsystemType;
  #name: string;
  #alias: string;
  #parameters: { parameter: string }[];

  constructor(props: { id: number; hvofSystemId: number; subsystemType: SubsystemType; name: string; alias: string; parameters: { parameter: string }[] }) {
    this.#id = props.id;
    this.#hvofSystemId = props.hvofSystemId;
    this.#subsystemType = props.subsystemType;
    this.#name = props.name;
    this.#alias = props.alias;
    this.#parameters = props.parameters;
  }

  get id(): number { return this.#id; }
  set id(value: number) { this.#id = value; }
  get hvofSystemId(): number { return this.#hvofSystemId; }
  set hvofSystemId(value: number) { this.#hvofSystemId = value; }
  get subsystemType(): SubsystemType { return this.#subsystemType; }
  set subsystemType(value: SubsystemType) { this.#subsystemType = value; }
  get name(): string { return this.#name; }
  set name(value: string) { this.#name = value; }
  get alias(): string { return this.#alias; }
  set alias(value: string) { this.#alias = value; }
  get parameters(): { parameter: string }[] { return this.#parameters; }
  set parameters(value: { parameter: string }[]) { this.#parameters = value; }
}
