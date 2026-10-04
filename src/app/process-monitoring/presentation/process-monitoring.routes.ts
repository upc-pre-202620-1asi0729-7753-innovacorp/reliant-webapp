import {Routes} from '@angular/router';
import {roleGuard} from '../../iam/infrastructure/iam.guard';
import {ROLE} from '../../iam/application/iam.store';

const spraySessionList = () => import('./views/spray-session-list/spray-session-list').then(m => m.SpraySessionList);
const spraySessionStart = () => import('./views/spray-session-start/spray-session-start').then(m => m.SpraySessionStart);
const spraySessionDetail = () => import('./views/spray-session-detail/spray-session-detail').then(m => m.SpraySessionDetail);
const baseTitle = 'Reliant';

export const processMonitoringRoutes: Routes = [
  { path: 'spray-sessions',      loadComponent: spraySessionList,  title: `${baseTitle} - Spray Sessions` },
  { path: 'spray-sessions/new',  loadComponent: spraySessionStart, title: `${baseTitle} - Start Session`, canActivate: [roleGuard(ROLE.ORG_ADMIN, ROLE.HVOF_OPERATOR, ROLE.OPERATIONS_SUPERVISOR)] },
  { path: 'spray-sessions/:id',  loadComponent: spraySessionDetail, title: `${baseTitle} - Session` }
];
