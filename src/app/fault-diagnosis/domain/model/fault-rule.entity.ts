import {BaseEntity} from '../../../shared/domain/model/base-entity';
import {FaultBand} from './fault-case.entity';

/** Diagnosis knowledge of the organization: what a deviation of a parameter usually means and what to do. */
export class FaultRule implements BaseEntity {
  id: number;
  organizationId: number;
  parameter: string;
  band: FaultBand;
  probableCause: string;
  recommendedAction: string;
  cooldownSeconds: number;

  constructor(props: { id: number; organizationId: number; parameter: string; band: FaultBand; probableCause: string; recommendedAction: string; cooldownSeconds: number }) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.parameter = props.parameter;
    this.band = props.band;
    this.probableCause = props.probableCause;
    this.recommendedAction = props.recommendedAction;
    this.cooldownSeconds = props.cooldownSeconds;
  }
}
