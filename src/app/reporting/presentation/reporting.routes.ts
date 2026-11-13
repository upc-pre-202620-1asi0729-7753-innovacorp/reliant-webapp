import {Routes} from '@angular/router';
import {roleGuard} from '../../iam/infrastructure/iam.guard';
import {ROLE} from '../../iam/application/iam.store';

const templateList = () => import('./views/report-template-list/report-template-list').then(m => m.ReportTemplateList);
const templateForm = () => import('./views/report-template-form/report-template-form').then(m => m.ReportTemplateForm);
const generatedList = () => import('./views/generated-report-list/generated-report-list').then(m => m.GeneratedReportList);
const baseTitle = 'Reliant';
const editors = roleGuard(ROLE.ORG_ADMIN, ROLE.QUALITY_ENGINEER);

export const reportingRoutes: Routes = [
  { path: 'templates',          loadComponent: templateList,  title: `${baseTitle} - Report Templates` },
  { path: 'templates/new',      loadComponent: templateForm,  title: `${baseTitle} - New Report Template`,  canActivate: [editors] },
  { path: 'templates/:id/edit', loadComponent: templateForm,  title: `${baseTitle} - Edit Report Template`, canActivate: [editors] },
  { path: 'generated',          loadComponent: generatedList, title: `${baseTitle} - Generated Reports` }
];
