import {HttpInterceptorFn} from '@angular/common/http';

export const iamInterceptor: HttpInterceptorFn = (request, next) => {
  const token = localStorage.getItem('reliant.token');
  const handledRequest = token
    ? request.clone({headers: request.headers.set('Authorization', `Bearer ${token}`)})
    : request;
  return next(handledRequest);
};
