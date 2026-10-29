import { Component, inject } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslateService } from '@ngx-translate/core';

const LANG_KEY = 'reliant.lang';

@Component({
  selector: 'app-language-switcher',
  imports: [MatButtonToggleModule],
  templateUrl: './language-switcher.html',
  styleUrl: './language-switcher.css',
})
export class LanguageSwitcher {
  protected currentLang: string;
  protected languages: string[];

  readonly #translate = inject(TranslateService);

  constructor() {
    this.currentLang = localStorage.getItem(LANG_KEY) ?? this.#translate.getCurrentLang() ?? 'en';

    this.languages = [...this.#translate.getLangs()];
    this.#translate.use(this.currentLang);
  }

  useLanguage(language: string) {
    this.#translate.use(language);
    this.currentLang = language;
    localStorage.setItem(LANG_KEY, language);
  }
}
