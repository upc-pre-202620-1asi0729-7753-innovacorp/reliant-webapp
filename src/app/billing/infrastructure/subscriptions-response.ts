import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {SubscriptionStatus} from '../domain/model/subscription.entity';

export interface SubscriptionsResponse extends BaseResponse { subscriptions: SubscriptionResource[]; }

export interface SubscriptionResource extends BaseResource {
  id: number;
  organizationId: number;
  planId: number;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
}
