import {BaseEntity} from '../../../shared/domain/model/base-entity';

export type PlanType = 'OPERATOR' | 'ASSET_OWNER';

export class Plan implements BaseEntity {
  #id: number;
  #name: string;
  #planType: PlanType;
  #monthlyPriceAmount: number;
  #monthlyPriceCurrency: string;
  #maxMonitoredSystems: number;
  #maxTrackedComponents: number;

  constructor(props: { id: number; name: string; planType: PlanType; monthlyPriceAmount: number; monthlyPriceCurrency: string; maxMonitoredSystems: number; maxTrackedComponents: number }) {
    this.#id = props.id;
    this.#name = props.name;
    this.#planType = props.planType;
    this.#monthlyPriceAmount = props.monthlyPriceAmount;
    this.#monthlyPriceCurrency = props.monthlyPriceCurrency;
    this.#maxMonitoredSystems = props.maxMonitoredSystems;
    this.#maxTrackedComponents = props.maxTrackedComponents;
  }

  get id(): number { return this.#id; }
  set id(value: number) { this.#id = value; }
  get name(): string { return this.#name; }
  get planType(): PlanType { return this.#planType; }
  get monthlyPriceAmount(): number { return this.#monthlyPriceAmount; }
  get monthlyPriceCurrency(): string { return this.#monthlyPriceCurrency; }
  get maxMonitoredSystems(): number { return this.#maxMonitoredSystems; }
  get maxTrackedComponents(): number { return this.#maxTrackedComponents; }
}
