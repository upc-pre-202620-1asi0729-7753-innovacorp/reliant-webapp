import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {FaultBand, FaultCaseStatus} from '../domain/model/fault-case.entity';

export interface FaultCasesResponse extends BaseResponse { faultCases: FaultCaseResource[]; }

export interface FaultCaseResource extends BaseResource {
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
}
