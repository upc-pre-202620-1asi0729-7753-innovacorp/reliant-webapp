import {BaseEntity} from '../../../shared/domain/model/base-entity';

export type FaultBand = 'warning' | 'shutdown';
export type FaultCaseStatus = 'open' | 'acknowledged' | 'resolved';

/** A fault case is opened by the platform when a reading leaves the warning or shutdown band of the recipe. */
export class FaultCase implements BaseEntity {
  id: number;
  organizationId: number;
  spraySessionId: number;
  hvofSystemId: number;
  parameter: string;
  band: FaultBand;
  value: number;
  epochMillis: number;
  probableCause: string;
  recommendedAction: string;
  status: FaultCaseStatus;
  acknowledgedBy: number | null;
  acknowledgedAt: string | null;
  resolvedBy: number | null;
  resolvedAt: string | null;
  resolutionNotes: string | null;

  constructor(props: {
    id: number; organizationId: number; spraySessionId: number; hvofSystemId: number; parameter: string; band: FaultBand; value: number;
    epochMillis: number; probableCause: string; recommendedAction: string; status: FaultCaseStatus; acknowledgedBy: number | null;
    acknowledgedAt: string | null; resolvedBy: number | null; resolvedAt: string | null; resolutionNotes: string | null;
  }) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.spraySessionId = props.spraySessionId;
    this.hvofSystemId = props.hvofSystemId;
    this.parameter = props.parameter;
    this.band = props.band;
    this.value = props.value;
    this.epochMillis = props.epochMillis;
    this.probableCause = props.probableCause;
    this.recommendedAction = props.recommendedAction;
    this.status = props.status;
    this.acknowledgedBy = props.acknowledgedBy;
    this.acknowledgedAt = props.acknowledgedAt;
    this.resolvedBy = props.resolvedBy;
    this.resolvedAt = props.resolvedAt;
    this.resolutionNotes = props.resolutionNotes;
  }

  get detectedAt(): Date {
    return new Date(this.epochMillis);
  }

  get isOpen(): boolean {
    return this.status !== 'resolved';
  }
}
