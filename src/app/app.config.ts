import {ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners} from '@angular/core';
import {provideRouter} from '@angular/router';
import {routes} from './app.routes';
import {provideTranslateService, TranslateService} from '@ngx-translate/core';
import {provideTranslateHttpLoader} from '@ngx-translate/http-loader';
import {provideHttpClient, withXhr} from '@angular/common/http';
import {environment} from '../environments/environment';
import {SIGN_UP_PORT} from './iam/infrastructure/sign-up.port';
import {SignUpApiEndpoint} from './iam/infrastructure/sign-up-api-endpoint';
import {FakeSignUpApiEndpoint} from './iam/infrastructure/fake-sign-up-api-endpoint';
import {SIGN_IN_PORT} from './iam/infrastructure/sign-in.port';
import {SignInApiEndpoint} from './iam/infrastructure/sign-in-api-endpoint';
import {FakeSignInApiEndpoint} from './iam/infrastructure/fake-sign-in-api-endpoint';
import { withInterceptors} from '@angular/common/http';
import {iamInterceptor} from './iam/infrastructure/iam.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withXhr(), withInterceptors([iamInterceptor])),    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: './i18n/', suffix: '.json' }),
      fallbackLang: 'en'
    }),
    provideAppInitializer(() => {
      const translate = inject(TranslateService);
      translate.addLangs(['en', 'es']);
      return translate.use('es');
    }),
    provideRouter(routes),
    {provide: SIGN_UP_PORT, useClass: environment.production ? SignUpApiEndpoint : FakeSignUpApiEndpoint},
    {provide: SIGN_IN_PORT, useClass: environment.production ? SignInApiEndpoint : FakeSignInApiEndpoint}
  ]
};
