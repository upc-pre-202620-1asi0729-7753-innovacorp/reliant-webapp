import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {Plan} from '../domain/model/plan.entity';
import {Subscription} from '../domain/model/subscription.entity';
import {PlansApiEndpoint} from './plans-api-endpoint';
import {SubscriptionsApiEndpoint} from './subscriptions-api-endpoint';

@Injectable({providedIn: 'root'})
export class BillingApi extends BaseApi {
  readonly #plansEndpoint = new PlansApiEndpoint(this.http);
  readonly #subscriptionsEndpoint = new SubscriptionsApiEndpoint(this.http);

  getPlans(): Observable<Plan[]> {
    return this.#plansEndpoint.getAll();
  }

  getSubscriptionsByOrganizationId(organizationId: number): Observable<Subscription[]> {
    return this.#subscriptionsEndpoint.getAllBy({organizationId});
  }

  createSubscription(subscription: Subscription): Observable<Subscription> {
    return this.#subscriptionsEndpoint.create(subscription);
  }
}
