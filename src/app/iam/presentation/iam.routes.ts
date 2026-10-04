import {Routes} from '@angular/router';
import {guestGuard, roleGuard} from '../infrastructure/iam.guard';
import {ROLE} from '../application/iam.store'

const baseTitle = 'Reliant';

const signUpForm = () => import('./views/sign-up-form/sign-up-form').then(m => m.SignUpForm);
const signInForm = () => import('./views/sign-in-form/sign-in-form').then(m => m.SignInForm);
const userList = () => import('./views/user-list/user-list').then(m => m.UserList);
const userRoleForm = () => import('./views/user-role-form/user-role-form').then(m => m.UserRoleForm);

export const iamRoutes: Routes = [
  { path: 'sign-up', loadComponent: signUpForm, title: `${baseTitle} - Sign Up`, canActivate: [guestGuard] },
  {path: 'sign-in', loadComponent: signInForm, title: `${baseTitle} - Sign In`, canActivate: [guestGuard] },
  { path: 'users',           loadComponent: userList,     title: `${baseTitle} - Users`, canActivate: [roleGuard(ROLE.ORG_ADMIN)] },
  { path: 'users/:id/roles', loadComponent: userRoleForm, title: `${baseTitle} - Roles`, canActivate: [roleGuard(ROLE.ORG_ADMIN)] }
];
