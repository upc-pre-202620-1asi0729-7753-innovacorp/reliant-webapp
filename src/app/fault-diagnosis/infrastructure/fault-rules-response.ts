import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {FaultBand} from '../domain/model/fault-case.entity';

export interface FaultRulesResponse extends BaseResponse { faultRules: FaultRuleResource[]; }

export interface FaultRuleResource extends BaseResource {
  id: number;
  organizationId: number;
  parameter: string;
  band: FaultBand;
  probableCause: string;
  recommendedAction: string;
  cooldownSeconds: number;
}
