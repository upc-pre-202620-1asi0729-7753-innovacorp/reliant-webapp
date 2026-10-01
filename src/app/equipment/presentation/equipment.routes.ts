import {Routes} from '@angular/router';

const hvofSystemList = () => import('./views/hvof-system-list/hvof-system-list').then(m => m.HvofSystemList);
const hvofSystemForm = () => import('./views/hvof-system-form/hvof-system-form').then(m => m.HvofSystemForm);
const hvofSystemDetail = () => import('./views/hvof-system-detail/hvof-system-detail').then(m => m.HvofSystemDetail);
const controllerForm = () => import('./views/controller-form/controller-form').then(m => m.ControllerForm);
const baseTitle = 'Reliant';

export const equipmentRoutes: Routes = [
  { path: 'hvof-systems',                                     loadComponent: hvofSystemList,   title: `${baseTitle} - HVOF Systems` },
  { path: 'hvof-systems/new',                                 loadComponent: hvofSystemForm,   title: `${baseTitle} - New HVOF System` },
  { path: 'hvof-systems/:id',                                 loadComponent: hvofSystemDetail, title: `${baseTitle} - HVOF System` },
  { path: 'hvof-systems/:id/edit',                            loadComponent: hvofSystemForm,   title: `${baseTitle} - Edit HVOF System` },
  { path: 'hvof-systems/:id/controllers/new',                 loadComponent: controllerForm,   title: `${baseTitle} - New Controller` },
  { path: 'hvof-systems/:id/controllers/:controllerId/edit',  loadComponent: controllerForm,   title: `${baseTitle} - Edit Controller` }
];
