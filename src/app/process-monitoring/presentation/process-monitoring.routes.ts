import {Routes} from '@angular/router';

const spraySessionList = () => import('./views/spray-session-list/spray-session-list').then(m => m.SpraySessionList);

export const processMonitoringRoutes: Routes = [
  { path: 'spray-sessions', loadComponent: spraySessionList }
];
