import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Sends the language the user picked in the UI as the `Accept-Language` header, so the platform localizes
 * its RFC 9457 problem details (validation guards, conflicts, not-found) in that same language.
 */
export const acceptLanguageInterceptor: HttpInterceptorFn = (request, next) => {
  const language = inject(TranslateService).getCurrentLang() ?? 'en';
  return next(request.clone({ headers: request.headers.set('Accept-Language', language) }));
};
