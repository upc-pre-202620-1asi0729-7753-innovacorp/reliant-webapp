import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { App } from './app';
import { SIGN_IN_PORT } from './iam/infrastructure/sign-in.port';
import { FakeSignInApiEndpoint } from './iam/infrastructure/fake-sign-in-api-endpoint';
import { SIGN_UP_PORT } from './iam/infrastructure/sign-up.port';
import { FakeSignUpApiEndpoint } from './iam/infrastructure/fake-sign-up-api-endpoint';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        {provide: SIGN_IN_PORT, useClass: FakeSignInApiEndpoint},
        {provide: SIGN_UP_PORT, useClass: FakeSignUpApiEndpoint}
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
