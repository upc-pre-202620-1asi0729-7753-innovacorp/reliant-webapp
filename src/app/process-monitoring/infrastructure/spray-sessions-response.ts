import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {SpraySessionStatus} from '../domain/model/spray-session.entity';

export interface SpraySessionsResponse extends BaseResponse { spraySessions: SpraySessionResource[]; }

export interface SpraySessionResource extends BaseResource {
  id: number;
  hvofSystemId: number;
  recuperationId: number;
  operatorId: number;
  recipeNumber: number;
  startedAt: string;
  endedAt: string | null;
  timeZone: string;
  status: SpraySessionStatus;
  abortReason?: string | null;
}
