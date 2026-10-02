import {BaseEntity} from '../../../shared/domain/model/base-entity';

export type SpraySessionStatus = 'active' | 'completed' | 'aborted' | 'interrupted';

export class SpraySession implements BaseEntity {
  #id: number;
  #hvofSystemId: number;
  #recuperationId: number;
  #operatorId: number;
  #recipeNumber: number;
  #startedAt: string;
  #endedAt: string | null;
  #timeZone: string;
  #status: SpraySessionStatus;
  #abortReason: string | null;

  constructor(props: {
    id: number; hvofSystemId: number; recuperationId: number; operatorId: number; recipeNumber: number;
    startedAt: string; endedAt: string | null; timeZone: string; status: SpraySessionStatus; abortReason?: string | null;
  }) {
    this.#id = props.id;
    this.#hvofSystemId = props.hvofSystemId;
    this.#recuperationId = props.recuperationId;
    this.#operatorId = props.operatorId;
    this.#recipeNumber = props.recipeNumber;
    this.#startedAt = props.startedAt;
    this.#endedAt = props.endedAt;
    this.#timeZone = props.timeZone;
    this.#status = props.status;
    this.#abortReason = props.abortReason ?? null;
  }

  get id(): number { return this.#id; }
  set id(value: number) { this.#id = value; }
  get hvofSystemId(): number { return this.#hvofSystemId; }
  set hvofSystemId(value: number) { this.#hvofSystemId = value; }
  get recuperationId(): number { return this.#recuperationId; }
  set recuperationId(value: number) { this.#recuperationId = value; }
  get operatorId(): number { return this.#operatorId; }
  set operatorId(value: number) { this.#operatorId = value; }
  get recipeNumber(): number { return this.#recipeNumber; }
  set recipeNumber(value: number) { this.#recipeNumber = value; }
  get startedAt(): string { return this.#startedAt; }
  set startedAt(value: string) { this.#startedAt = value; }
  get endedAt(): string | null { return this.#endedAt; }
  set endedAt(value: string | null) { this.#endedAt = value; }
  get timeZone(): string { return this.#timeZone; }
  set timeZone(value: string) { this.#timeZone = value; }
  get status(): SpraySessionStatus { return this.#status; }
  set status(value: SpraySessionStatus) { this.#status = value; }
  get abortReason(): string | null { return this.#abortReason; }
  set abortReason(value: string | null) { this.#abortReason = value; }

  get isActive(): boolean { return this.#status === 'active'; }
}
