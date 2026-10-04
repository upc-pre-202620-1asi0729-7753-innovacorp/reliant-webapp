import {Component, computed, inject} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {LanguageSwitcher} from '../language-switcher/language-switcher';
import {FooterContent} from '../footer-content/footer-content';
import {AuthenticationSection} from '../../../../iam/presentation/components/authentication-section/authentication-section';
import {IamStore} from '../../../../iam/application/iam.store';

interface NavOption {
  link: string;
  label: string;
  visible: boolean;
}

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, TranslatePipe, LanguageSwitcher, FooterContent, AuthenticationSection],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {
  readonly #iam = inject(IamStore);

  readonly options = computed<NavOption[]>(() => {
    const signedIn = this.#iam.isSignedIn();
    const supplier = this.#iam.isSupplier();
    return [
      {link: '/home',                              label: 'option.home',           visible: signedIn},
      {link: '/traceability/recuperations',        label: 'option.recuperations',  visible: supplier},
      {link: '/traceability/components',           label: 'option.components',     visible: supplier},
      {link: '/traceability/customers',            label: 'option.customers',      visible: supplier},
      {link: '/equipment/hvof-systems',            label: 'option.hvof-systems',   visible: supplier},
      {link: '/process-monitoring/spray-sessions', label: 'option.spray-sessions', visible: supplier},
      {link: '/about',                             label: 'option.about',          visible: true,},
      {link: '/iam/users', label: 'option.users', visible: this.#iam.isAdmin()},

    ].filter(o => o.visible);
  });
}
