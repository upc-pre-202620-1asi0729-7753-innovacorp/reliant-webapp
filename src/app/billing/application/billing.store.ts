import {computed, inject, Injectable, signal} from '@angular/core';
import {Plan} from '../domain/model/plan.entity';
import {Subscription} from '../domain/model/subscription.entity';
import {BillingApi} from '../infrastructure/billing-api';
import {IamStore} from '../../iam/application/iam.store';

@Injectable({providedIn: 'root'})
export class BillingStore {
  readonly #api = inject(BillingApi);
  readonly #iam = inject(IamStore);

  readonly #plansSignal = signal<Plan[]>([]);
  readonly plans = this.#plansSignal.asReadonly();
  readonly #subscriptionsSignal = signal<Subscription[]>([]);
  readonly subscription = computed(() => this.#subscriptionsSignal().find(s => s.status === 'ACTIVE') ?? null);
  readonly currentPlan = computed(() => {
    const sub = this.subscription();
    return sub ? this.plans().find(p => p.id === sub.planId) ?? null : null;
  });
  readonly #errorSignal = signal<string | null>(null);
  readonly error = this.#errorSignal.asReadonly();

  readonly allowedPlanType = computed(() => this.#iam.isSupplier() ? 'OPERATOR' : 'ASSET_OWNER');

  load() {
    const organizationId = this.#iam.organizationId();
    if (!organizationId) return;
    this.#api.getPlans().subscribe({next: plans => this.#plansSignal.set(plans)});
    this.#api.getSubscriptionsByOrganizationId(organizationId).subscribe({next: subs => this.#subscriptionsSignal.set(subs)});
  }

  canSelect(plan: Plan): boolean {
    return plan.planType === this.allowedPlanType() && this.currentPlan()?.id !== plan.id;
  }

  selectPlan(plan: Plan, onDone: () => void) {
    const organizationId = this.#iam.organizationId();
    if (!organizationId || !this.canSelect(plan)) return;
    const start = new Date();
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    const subscription = new Subscription({
      id: 0,
      organizationId,
      planId: plan.id,
      startDate: start.toISOString().substring(0, 10),
      endDate: end.toISOString().substring(0, 10),
      status: 'ACTIVE'
    });
    this.#api.createSubscription(subscription).subscribe({
      next: created => {
        this.#subscriptionsSignal.update(list => [...list, created]);
        onDone();
      },
      error: (err: Error) => this.#errorSignal.set(err.message)
    });
  }
}
