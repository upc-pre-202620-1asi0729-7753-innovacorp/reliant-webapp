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

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withXhr()),
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: './i18n/', suffix: '.json' }),
      fallbackLang: 'en'
    }),
    provideAppInitializer(() => {
      const translate = inject(TranslateService);
      translate.addLangs(['en', 'es']);
      return translate.use('es');
    }),
    provideRouter(routes),
    {provide: SIGN_UP_PORT, useClass: environment.production ? SignUpApiEndpoint : FakeSignUpApiEndpoint}
  ]
};
