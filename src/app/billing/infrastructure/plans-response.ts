import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {PlanType} from '../domain/model/plan.entity';

export interface PlansResponse extends BaseResponse { plans: PlanResource[]; }

export interface PlanResource extends BaseResource {
  id: number;
  name: string;
  planType: PlanType;
  monthlyPriceAmount: number;
  monthlyPriceCurrency: string;
  maxMonitoredSystems: number;
  maxTrackedComponents: number;
}
