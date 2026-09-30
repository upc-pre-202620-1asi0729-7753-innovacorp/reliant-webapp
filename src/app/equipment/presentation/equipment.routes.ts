import {Routes} from '@angular/router';

const hvofSystemList = () => import('./views/hvof-system-list/hvof-system-list').then(m => m.HvofSystemList);

export const equipmentRoutes: Routes = [
  { path: 'hvof-systems', loadComponent: hvofSystemList }
];
