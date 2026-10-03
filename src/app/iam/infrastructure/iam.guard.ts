import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {IamStore} from '../application/iam.store';

export const iamGuard: CanActivateFn = () => {
  const store = inject(IamStore);
  const router = inject(Router);
  if (store.isSignedIn()) return true;
  router.navigate(['/iam/sign-in']).then();
  return false;
};

export const supplierGuard: CanActivateFn = () => {
  const store = inject(IamStore);
  const router = inject(Router);
  if (store.isSignedIn() && store.isSupplier()) return true;
  router.navigate([store.isSignedIn() ? '/home' : '/iam/sign-in']).then();
  return false;
};

export const roleGuard = (...roleIds: number[]): CanActivateFn => () => {
  const store = inject(IamStore);
  const router = inject(Router);
  if (store.isSignedIn() && store.hasRole(...roleIds)) return true;
  router.navigate([store.isSignedIn() ? '/home' : '/iam/sign-in']).then();
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const store = inject(IamStore);
  const router = inject(Router);
  if (!store.isSignedIn()) return true;
  router.navigate(['/home']).then();
  return false;
};
