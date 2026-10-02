import {Routes} from '@angular/router';

const spraySessionList = () => import('./views/spray-session-list/spray-session-list').then(m => m.SpraySessionList);
const spraySessionStart = () => import('./views/spray-session-start/spray-session-start').then(m => m.SpraySessionStart);
const spraySessionDetail = () => import('./views/spray-session-detail/spray-session-detail').then(m => m.SpraySessionDetail);
const baseTitle = 'Reliant';

export const processMonitoringRoutes: Routes = [
  { path: 'spray-sessions',      loadComponent: spraySessionList,  title: `${baseTitle} - Spray Sessions` },
  { path: 'spray-sessions/new',  loadComponent: spraySessionStart, title: `${baseTitle} - Start Session` },
  { path: 'spray-sessions/:id',  loadComponent: spraySessionDetail, title: `${baseTitle} - Session` }
];
