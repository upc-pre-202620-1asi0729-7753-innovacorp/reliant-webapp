import {Routes} from '@angular/router';

const customerList = () => import('./views/customer-list/customer-list').then(m => m.CustomerList);
const componentList = () => import('./views/component-list/component-list').then(m => m.ComponentList);
const recuperationList = () => import('./views/recuperation-list/recuperation-list').then(m => m.RecuperationList);

export const traceabilityRoutes: Routes = [
  { path: 'customers',     loadComponent: customerList },
  { path: 'components',    loadComponent: componentList },
  { path: 'recuperations', loadComponent: recuperationList }
];
