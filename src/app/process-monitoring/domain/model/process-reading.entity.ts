import {BaseEntity} from '../../../shared/domain/model/base-entity';

export type Band = 'nominal' | 'out_of_nominal' | 'warning' | 'shutdown';

export class ProcessReading implements BaseEntity {
  #id: number;
  #spraySessionId: number;
  #epochMillis: number;
  #plcClockOffsetMillis: number;
  #tagPath: string;
  #parameter: string;
  #subsystemId: number | null;
  #partId: number | null;
  #value: number;
  #unitSymbol: string;
  #unitCategory: string;
  #band: Band;
  #derived: boolean;
  #mappingPending: boolean;

  constructor(props: {
    id: number; spraySessionId: number; epochMillis: number; plcClockOffsetMillis: number; tagPath: string; parameter: string;
    subsystemId: number | null; partId: number | null; value: number; unitSymbol: string; unitCategory: string;
    band: Band; derived: boolean; mappingPending: boolean;
  }) {
    this.#id = props.id;
    this.#spraySessionId = props.spraySessionId;
    this.#epochMillis = props.epochMillis;
    this.#plcClockOffsetMillis = props.plcClockOffsetMillis;
    this.#tagPath = props.tagPath;
    this.#parameter = props.parameter;
    this.#subsystemId = props.subsystemId;
    this.#partId = props.partId;
    this.#value = props.value;
    this.#unitSymbol = props.unitSymbol;
    this.#unitCategory = props.unitCategory;
    this.#band = props.band;
    this.#derived = props.derived;
    this.#mappingPending = props.mappingPending;
  }

  get id(): number { return this.#id; }
  set id(value: number) { this.#id = value; }
  get spraySessionId(): number { return this.#spraySessionId; }
  get epochMillis(): number { return this.#epochMillis; }
  get plcClockOffsetMillis(): number { return this.#plcClockOffsetMillis; }
  get tagPath(): string { return this.#tagPath; }
  get parameter(): string { return this.#parameter; }
  get subsystemId(): number | null { return this.#subsystemId; }
  get partId(): number | null { return this.#partId; }
  get value(): number { return this.#value; }
  get unitSymbol(): string { return this.#unitSymbol; }
  get unitCategory(): string { return this.#unitCategory; }
  get band(): Band { return this.#band; }
  get derived(): boolean { return this.#derived; }
  get mappingPending(): boolean { return this.#mappingPending; }

  get timestamp(): Date { return new Date(this.#epochMillis); }
}
