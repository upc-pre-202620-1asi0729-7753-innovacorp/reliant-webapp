import {Routes} from '@angular/router';
import {roleGuard} from '../../iam/infrastructure/iam.guard';
import {ROLE} from '../../iam/application/iam.store';

const faultCaseList = () => import('./views/fault-case-list/fault-case-list').then(m => m.FaultCaseList);
const faultCaseDetail = () => import('./views/fault-case-detail/fault-case-detail').then(m => m.FaultCaseDetail);
const faultRuleList = () => import('./views/fault-rule-list/fault-rule-list').then(m => m.FaultRuleList);
const faultRuleForm = () => import('./views/fault-rule-form/fault-rule-form').then(m => m.FaultRuleForm);
const baseTitle = 'Reliant';

export const faultDiagnosisRoutes: Routes = [
  { path: 'fault-cases',          loadComponent: faultCaseList,   title: `${baseTitle} - Fault Cases` },
  { path: 'fault-cases/:id',      loadComponent: faultCaseDetail, title: `${baseTitle} - Fault Case` },
  { path: 'fault-rules',          loadComponent: faultRuleList,   title: `${baseTitle} - Fault Rules` },
  { path: 'fault-rules/new',      loadComponent: faultRuleForm,   title: `${baseTitle} - New Fault Rule`,  canActivate: [roleGuard(ROLE.ORG_ADMIN)] },
  { path: 'fault-rules/:id/edit', loadComponent: faultRuleForm,   title: `${baseTitle} - Edit Fault Rule`, canActivate: [roleGuard(ROLE.ORG_ADMIN)] }
];
