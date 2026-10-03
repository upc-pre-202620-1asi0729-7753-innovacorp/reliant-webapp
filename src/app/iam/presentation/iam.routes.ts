import {Routes} from '@angular/router';
import {guestGuard} from '../infrastructure/iam.guard';

const baseTitle = 'Reliant';

const signUpForm = () => import('./views/sign-up-form/sign-up-form').then(m => m.SignUpForm);
const signInForm = () => import('./views/sign-in-form/sign-in-form').then(m => m.SignInForm);

export const iamRoutes: Routes = [
  { path: 'sign-up', loadComponent: signUpForm, title: `${baseTitle} - Sign Up`, canActivate: [guestGuard] },
  {path: 'sign-in', loadComponent: signInForm, title: `${baseTitle} - Sign In`, canActivate: [guestGuard] },
];
