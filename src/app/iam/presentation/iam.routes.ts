import {Routes} from '@angular/router';

const signUpForm = () => import('./views/sign-up-form/sign-up-form').then(m => m.SignUpForm);
const baseTitle = 'Reliant';

export const iamRoutes: Routes = [
  { path: 'sign-up', loadComponent: signUpForm, title: `${baseTitle} - Sign Up` }
];
