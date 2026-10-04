import {BaseEntity} from '../../../shared/domain/model/base-entity';

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export class Subscription implements BaseEntity {
  #id: number;
  #organizationId: number;
  #planId: number;
  #startDate: string;
  #endDate: string;
  #status: SubscriptionStatus;

  constructor(props: { id: number; organizationId: number; planId: number; startDate: string; endDate: string; status: SubscriptionStatus }) {
    this.#id = props.id;
    this.#organizationId = props.organizationId;
    this.#planId = props.planId;
    this.#startDate = props.startDate;
    this.#endDate = props.endDate;
    this.#status = props.status;
  }

  get id(): number { return this.#id; }
  set id(value: number) { this.#id = value; }
  get organizationId(): number { return this.#organizationId; }
  get planId(): number { return this.#planId; }
  get startDate(): string { return this.#startDate; }
  get endDate(): string { return this.#endDate; }
  get status(): SubscriptionStatus { return this.#status; }

  get daysToExpiry(): number {
    return Math.ceil((new Date(this.#endDate).getTime() - Date.now()) / 86_400_000);
  }
}
