import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageSwitcher } from '../language-switcher/language-switcher';
import { FooterContent } from '../footer-content/footer-content';
import { AuthenticationSection } from '../../../../iam/presentation/components/authentication-section/authentication-section';
import { IamStore } from '../../../../iam/application/iam.store';

interface NavOption {
  link: string;
  label: string;
  icon: string;
  visible: boolean;
}

interface NavGroup {
  label: string;
  options: NavOption[];
}

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    LanguageSwitcher,
    FooterContent,
    AuthenticationSection,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  readonly iam = inject(IamStore);
  readonly menuOpen = signal(false);

  readonly groups = computed<NavGroup[]>(() => {
    const signedIn = this.iam.isSignedIn();
    const supplier = this.iam.isSupplier();
    const owner = this.iam.isAssetOwner();
    const admin = this.iam.isAdmin();

    const groups: NavGroup[] = [
      {
        label: 'nav.group.overview',
        options: [
          { link: '/home', label: 'option.home', icon: 'space_dashboard', visible: signedIn },
          {
            link: '/process-monitoring/spray-sessions',
            label: 'option.spray-sessions',
            icon: 'monitoring',
            visible: supplier,
          },
        ],
      },
      {
        label: 'nav.group.traceability',
        options: [
          {
            link: '/traceability/recuperations',
            label: 'option.recuperations',
            icon: 'conveyor_belt',
            visible: supplier,
          },
          {
            link: '/traceability/components',
            label: 'option.components',
            icon: 'settings_input_component',
            visible: supplier || owner,
          },
          {
            link: '/traceability/customers',
            label: 'option.customers',
            icon: 'apartment',
            visible: supplier,
          },
        ],
      },
      {
        label: 'nav.group.equipment',
        options: [
          {
            link: '/equipment/hvof-systems',
            label: 'option.hvof-systems',
            icon: 'precision_manufacturing',
            visible: supplier,
          },
        ],
      },
      {
        label: 'nav.group.account',
        options: [
          { link: '/iam/users', label: 'option.users', icon: 'group', visible: admin },
          {
            link: '/billing/subscription',
            label: 'option.subscription',
            icon: 'credit_card',
            visible: admin,
          },
          { link: '/about', label: 'option.about', icon: 'info', visible: true },
        ],
      },
    ];

    return groups
      .map((g) => ({ ...g, options: g.options.filter((o) => o.visible) }))
      .filter((g) => g.options.length > 0);
  });

  toggleMenu() {
    this.menuOpen.update((v) => !v);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }
}
