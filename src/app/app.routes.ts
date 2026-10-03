import {Routes} from '@angular/router';
import {Home} from './shared/presentation/views/home/home';

const about = () => import('./shared/presentation/views/about/about').then(m => m.About);
const pageNotFound = () => import('./shared/presentation/views/page-not-found/page-not-found').then(m => m.PageNotFound);
const traceabilityRoutes = () => import('./traceability/presentation/traceability.routes').then(m => m.traceabilityRoutes);
const equipmentRoutes = () => import('./equipment/presentation/equipment.routes').then(m => m.equipmentRoutes);
const processMonitoringRoutes = () => import('./process-monitoring/presentation/process-monitoring.routes').then(m => m.processMonitoringRoutes);
const iamRoutes = () => import('./iam/presentation/iam.routes').then(m => m.iamRoutes);
const baseTitle = 'Reliant';

export const routes: Routes = [
  { path: 'home',               component:     Home,                     title: `${baseTitle} - Home` },
  { path: 'about',              loadComponent: about,                    title: `${baseTitle} - About` },
  { path: 'traceability',       loadChildren:  traceabilityRoutes },
  { path: 'equipment',          loadChildren:  equipmentRoutes },
  { path: 'process-monitoring', loadChildren:  processMonitoringRoutes },
  { path: 'iam',                loadChildren:  iamRoutes },
  { path: '',                   redirectTo:    '/home', pathMatch: 'full' },
  { path: '**',                 loadComponent: pageNotFound,             title: `${baseTitle} - Page Not Found` }
];
