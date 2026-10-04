import {Routes} from '@angular/router';

const customerList = () => import('./views/customer-list/customer-list').then(m => m.CustomerList);
const customerForm = () => import('./views/customer-form/customer-form').then(m => m.CustomerForm);
const componentList = () => import('./views/component-list/component-list').then(m => m.ComponentList);
const componentForm = () => import('./views/component-form/component-form').then(m => m.ComponentForm);
const recuperationList = () => import('./views/recuperation-list/recuperation-list').then(m => m.RecuperationList);
const recuperationForm = () => import('./views/recuperation-form/recuperation-form').then(m => m.RecuperationForm);

const baseTitle = 'Reliant';

export const traceabilityRoutes: Routes = [
  { path: 'customers',     loadComponent: customerList },
  { path: 'customers/new',          loadComponent: customerForm,     title: `${baseTitle} - New Customer` },
  { path: 'customers/:id/edit',     loadComponent: customerForm,     title: `${baseTitle} - Edit Customer` },
  { path: 'components',             loadComponent: componentList,    title: `${baseTitle} - Components` },
  { path: 'components/new',         loadComponent: componentForm,    title: `${baseTitle} - New Component` },
  { path: 'components/:id/edit',    loadComponent: componentForm,    title: `${baseTitle} - Edit Component` },
  { path: 'recuperations',          loadComponent: recuperationList, title: `${baseTitle} - Recuperations` },
  { path: 'recuperations/new',      loadComponent: recuperationForm, title: `${baseTitle} - New Recuperation` },
  { path: 'recuperations/:id/edit', loadComponent: recuperationForm, title: `${baseTitle} - Edit Recuperation` }
];
