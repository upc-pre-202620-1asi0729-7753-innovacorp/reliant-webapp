import {Routes} from '@angular/router';

const hvofSystemList = () => import('./views/hvof-system-list/hvof-system-list').then(m => m.HvofSystemList);
const hvofSystemForm = () => import('./views/hvof-system-form/hvof-system-form').then(m => m.HvofSystemForm);
const hvofSystemDetail = () => import('./views/hvof-system-detail/hvof-system-detail').then(m => m.HvofSystemDetail);
const controllerForm = () => import('./views/controller-form/controller-form').then(m => m.ControllerForm);
const hvofSubsystemForm = () => import('./views/hvof-subsystem-form/hvof-subsystem-form').then(m => m.HvofSubsystemForm);
const hvofPartForm = () => import('./views/hvof-part-form/hvof-part-form').then(m => m.HvofPartForm);
const recipeForm = () => import('./views/recipe-form/recipe-form').then(m => m.RecipeForm);
const baseTitle = 'Reliant';

export const equipmentRoutes: Routes = [
  { path: 'hvof-systems',                                     loadComponent: hvofSystemList,   title: `${baseTitle} - HVOF Systems` },
  { path: 'hvof-systems/new',                                 loadComponent: hvofSystemForm,   title: `${baseTitle} - New HVOF System` },
  { path: 'hvof-systems/:id',                                 loadComponent: hvofSystemDetail, title: `${baseTitle} - HVOF System` },
  { path: 'hvof-systems/:id/edit',                            loadComponent: hvofSystemForm,   title: `${baseTitle} - Edit HVOF System` },
  { path: 'hvof-systems/:id/controllers/new',                 loadComponent: controllerForm,   title: `${baseTitle} - New Controller` },
  { path: 'hvof-systems/:id/controllers/:controllerId/edit',  loadComponent: controllerForm,   title: `${baseTitle} - Edit Controller` },
  { path: 'hvof-systems/:id/subsystems/new',                        loadComponent: hvofSubsystemForm, title: `${baseTitle} - New Subsystem` },
  { path: 'hvof-systems/:id/subsystems/:subsystemId/edit',          loadComponent: hvofSubsystemForm, title: `${baseTitle} - Edit Subsystem` },
  { path: 'hvof-systems/:id/subsystems/:subsystemId/parts/new',     loadComponent: hvofPartForm,      title: `${baseTitle} - New Part` },
  { path: 'hvof-systems/:id/recipes/new',              loadComponent: recipeForm, title: `${baseTitle} - New Recipe` },
  { path: 'hvof-systems/:id/recipes/:recipeId/edit',   loadComponent: recipeForm, title: `${baseTitle} - Edit Recipe` }
];
