import {Component, signal} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {LanguageSwitcher} from '../language-switcher/language-switcher';
import {FooterContent} from '../footer-content/footer-content';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    RouterLinkActive,
    TranslatePipe,
    LanguageSwitcher,
    FooterContent
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {
  options = signal([
    {link: '/home', label: 'option.home'},
    {link: '/traceability/recuperations', label: 'option.recuperations'},
    {link: '/traceability/components', label: 'option.components'},
    {link: '/traceability/customers', label: 'option.customers'},
    {link: '/equipment/hvof-systems', label: 'option.hvof-systems'},
    {link: '/process-monitoring/spray-sessions', label: 'option.spray-sessions'},
    {link: '/about', label: 'option.about'}
  ]);
}
