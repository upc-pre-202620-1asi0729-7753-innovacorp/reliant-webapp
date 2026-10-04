import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Subscription} from '../domain/model/subscription.entity';
import {SubscriptionResource, SubscriptionsResponse} from './subscriptions-response';

export class SubscriptionAssembler implements BaseAssembler<Subscription, SubscriptionResource, SubscriptionsResponse> {
  toEntitiesFromResponse(response: SubscriptionsResponse): Subscription[] { return response.subscriptions.map(r => this.toEntityFromResource(r)); }
  toEntityFromResource(r: SubscriptionResource): Subscription { return new Subscription({...r}); }
  toResourceFromEntity(e: Subscription): SubscriptionResource {
    return { id: e.id, organizationId: e.organizationId, planId: e.planId, startDate: e.startDate, endDate: e.endDate, status: e.status };
  }
}
