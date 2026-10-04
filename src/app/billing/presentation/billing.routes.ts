import {Routes} from '@angular/router';
import {roleGuard} from '../../iam/infrastructure/iam.guard';
import {ROLE} from '../../iam/application/iam.store';

const planSelection = () => import('./views/plan-selection/plan-selection').then(m => m.PlanSelection);
const subscriptionDetail = () => import('./views/subscription-detail/subscription-detail').then(m => m.SubscriptionDetail);
const baseTitle = 'Reliant';

export const billingRoutes: Routes = [
  { path: 'plans',        loadComponent: planSelection,      title: `${baseTitle} - Plans`,        canActivate: [roleGuard(ROLE.ORG_ADMIN)] },
  { path: 'subscription', loadComponent: subscriptionDetail, title: `${baseTitle} - Subscription`, canActivate: [roleGuard(ROLE.ORG_ADMIN)] }
];
