import {BaseEntity} from '../../../shared/domain/model/base-entity';

export type RecipeStatus = 'DRAFT' | 'ACTIVE' | 'RETIRED';

export interface RecipeApplicability {
  componentType: string;
  machineModel: string;
  position: string;
}

export interface RecipeParameter {
  parameter: string;
  setpoint: number;
  lowerShutdown: number;
  lowerWarning: number;
  nominalMin: number;
  nominalMax: number;
  upperWarning: number;
  upperShutdown: number;
  unitSymbol: string;
  unitCategory: string;
}

export class Recipe implements BaseEntity {
  #id: number;
  #hvofSystemId: number;
  #recipeNumber: number;
  #name: string;
  #powderSpecification: string;
  #status: RecipeStatus;
  #applicabilities: RecipeApplicability[];
  #parameters: RecipeParameter[];

  constructor(props: {
    id: number; hvofSystemId: number; recipeNumber: number; name: string; powderSpecification: string;
    status: RecipeStatus; applicabilities: RecipeApplicability[]; parameters: RecipeParameter[];
  }) {
    this.#id = props.id;
    this.#hvofSystemId = props.hvofSystemId;
    this.#recipeNumber = props.recipeNumber;
    this.#name = props.name;
    this.#powderSpecification = props.powderSpecification;
    this.#status = props.status;
    this.#applicabilities = props.applicabilities;
    this.#parameters = props.parameters;
  }

  get id(): number { return this.#id; }
  set id(value: number) { this.#id = value; }
  get hvofSystemId(): number { return this.#hvofSystemId; }
  set hvofSystemId(value: number) { this.#hvofSystemId = value; }
  get recipeNumber(): number { return this.#recipeNumber; }
  set recipeNumber(value: number) { this.#recipeNumber = value; }
  get name(): string { return this.#name; }
  set name(value: string) { this.#name = value; }
  get powderSpecification(): string { return this.#powderSpecification; }
  set powderSpecification(value: string) { this.#powderSpecification = value; }
  get status(): RecipeStatus { return this.#status; }
  set status(value: RecipeStatus) { this.#status = value; }
  get applicabilities(): RecipeApplicability[] { return this.#applicabilities; }
  set applicabilities(value: RecipeApplicability[]) { this.#applicabilities = value; }
  get parameters(): RecipeParameter[] { return this.#parameters; }
  set parameters(value: RecipeParameter[]) { this.#parameters = value; }

  parameterFor(parameter: string): RecipeParameter | undefined {
    return this.#parameters.find(p => p.parameter === parameter);
  }
}
