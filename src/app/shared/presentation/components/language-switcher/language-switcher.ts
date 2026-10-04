import {Component, inject} from '@angular/core';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-language-switcher',
  imports: [
    MatButtonToggleModule
  ],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css'
})
export class LanguageSwitcher {
  protected currentLang = 'es';
  protected languages: string[];
  #translate: TranslateService;

  constructor() {
    this.#translate = inject(TranslateService);
    this.currentLang = this.#translate.getCurrentLang() ?? 'es';
    this.languages = [...this.#translate.getLangs()];
  }

  useLanguage(language: string) {
    this.#translate.use(language);
    this.currentLang = language;
  }
}
