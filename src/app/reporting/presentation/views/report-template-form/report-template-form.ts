import {Component, computed, effect, inject, signal} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UpperCasePipe} from '@angular/common';
import {toSignal} from '@angular/core/rxjs-interop';
import {map} from 'rxjs';
import {FormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule, MatError} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {TranslatePipe, TranslateService} from '@ngx-translate/core';
import {ReportingStore} from '../../../application/reporting.store';
import {EquipmentStore} from '../../../../equipment/application/equipment.store';
import {IamStore} from '../../../../iam/application/iam.store';
import {
  AGGREGATIONS, emptySection, emptyWidget, ORIENTATIONS, PAGE_SIZES, PageOrientation, PageSize, REPORT_KINDS, ReportKind, ReportSection,
  ReportTemplate, ReportWidget, SOURCE_VARIABLES, VARIABLE_SOURCES, VariableSource, VIEWS_BY_SOURCE, WIDGET_WIDTHS
} from '../../../domain/model/report-template.entity';
import {TemplatePreview} from '../../components/template-preview/template-preview';

interface TemplateDraft {
  name: string;
  description: string;
  reportKind: ReportKind;
  primaryColor: string;
  secondaryColor: string;
  headerText: string;
  footerText: string;
  pageSize: PageSize;
  orientation: PageOrientation;
  showSignatureBlock: boolean;
  defaultForKind: boolean;
  sections: ReportSection[];
}

/**
 * Template builder: branding and page setup on the left, sections with widgets in the middle, live preview on the right.
 */
@Component({
  selector: 'app-report-template-form',
  imports: [FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule, MatAutocompleteModule, MatError, TranslatePipe, TemplatePreview, UpperCasePipe],
  templateUrl: './report-template-form.html',
  styleUrl: './report-template-form.css'
})
export class ReportTemplateForm {
  readonly store = inject(ReportingStore);
  readonly equipment = inject(EquipmentStore);
  readonly iam = inject(IamStore);
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #translate = inject(TranslateService);

  readonly editingId = toSignal(this.#route.params.pipe(map(p => p['id'] ? +p['id'] : null)), {initialValue: null});
  readonly submitted = signal(false);
  readonly saving = signal(false);
  readonly draft = signal<TemplateDraft>({
    name: '', description: '', reportKind: 'session_report', primaryColor: '#0E1A2B', secondaryColor: '#D4781C', headerText: '',
    footerText: 'Documento generado con Reliant', pageSize: 'a4', orientation: 'portrait', showSignatureBlock: false, defaultForKind: false, sections: [emptySection(1)]
  });
  #loaded = false;

  readonly kinds = REPORT_KINDS;
  readonly pageSizes = PAGE_SIZES;
  readonly orientations = ORIENTATIONS;
  readonly sources = VARIABLE_SOURCES;
  readonly aggregations = AGGREGATIONS;
  readonly widths = WIDGET_WIDTHS;

  readonly processParameters = computed(() => [...new Set([
    ...this.equipment.recipes().flatMap(r => r.parameters.map(p => p.parameter)),
    ...this.equipment.subsystems().flatMap(s => s.parameters.map(p => p.parameter))
  ])].sort());

  readonly valid = computed(() => {
    const d = this.draft();
    const hex = (v: string) => /^#[0-9A-Fa-f]{6}$/.test(v ?? '');
    const required = (v: string) => String(v ?? '').trim().length > 0;
    return required(d.name) && hex(d.primaryColor) && hex(d.secondaryColor) && d.sections.length > 0 &&
      d.sections.every(s => required(s.title) && s.widgets.length > 0 && s.widgets.every(w => required(w.variableCode) && required(w.variableLabel)));
  });

  constructor() {
    effect(() => {
      const id = this.editingId();
      if (!id || this.#loaded || !this.store.templatesLoaded()) return;
      const tpl = this.store.getTemplateById(id)();
      if (!tpl) return;
      this.#loaded = true;
      this.draft.set({
        name: tpl.name, description: tpl.description, reportKind: tpl.reportKind, primaryColor: tpl.primaryColor, secondaryColor: tpl.secondaryColor,
        headerText: tpl.headerText, footerText: tpl.footerText, pageSize: tpl.pageSize, orientation: tpl.orientation,
        showSignatureBlock: tpl.showSignatureBlock, defaultForKind: tpl.defaultForKind,
        sections: tpl.orderedSections.map(s => ({...s, widgets: s.widgets.map(w => ({...w}))}))
      });
    });
  }

  viewsOf(source: VariableSource) {
    return VIEWS_BY_SOURCE[source];
  }

  variablesOf(source: VariableSource): string[] {
    return source === 'process' ? this.processParameters() : SOURCE_VARIABLES[source];
  }

  variableLabel(source: VariableSource, code: string): string {
    const key = source === 'process' ? 'parameter.' + code : `reports.variable.${source}.${code}`;
    const value = this.#translate.instant(key) as string;
    return value === key ? code : value;
  }

  update<K extends keyof TemplateDraft>(key: K, value: TemplateDraft[K]) {
    this.draft.update(d => ({...d, [key]: value}));
  }

  #mutate(fn: (sections: ReportSection[]) => void) {
    const sections = this.draft().sections.map(s => ({...s, widgets: s.widgets.map(w => ({...w}))}));
    fn(sections);
    sections.forEach((s, i) => { s.sectionOrder = i + 1; s.widgets.forEach((w, j) => w.position = j + 1); });
    this.draft.update(d => ({...d, sections}));
  }

  addSection() { this.#mutate(s => s.push(emptySection(s.length + 1))); }
  removeSection(i: number) { this.#mutate(s => s.splice(i, 1)); }
  moveSection(i: number, delta: number) {
    this.#mutate(s => { const j = i + delta; if (j < 0 || j >= s.length) return; [s[i], s[j]] = [s[j], s[i]]; });
  }
  setSectionTitle(i: number, title: string) { this.#mutate(s => { s[i].title = title; }); }
  addWidget(i: number) { this.#mutate(s => s[i].widgets.push(emptyWidget(s[i].widgets.length + 1))); }
  removeWidget(i: number, j: number) { this.#mutate(s => s[i].widgets.splice(j, 1)); }
  moveWidget(i: number, j: number, delta: number) {
    this.#mutate(s => { const w = s[i].widgets; const k = j + delta; if (k < 0 || k >= w.length) return; [w[j], w[k]] = [w[k], w[j]]; });
  }

  setWidget<K extends keyof ReportWidget>(i: number, j: number, key: K, value: ReportWidget[K]) {
    this.#mutate(s => {
      const w = s[i].widgets[j];
      (w as unknown as Record<string, unknown>)[key] = value;
      if (key === 'variableSource') {
        w.variableCode = '';
        w.viewType = VIEWS_BY_SOURCE[w.variableSource][0];
        if (w.variableSource !== 'process') w.aggregation = w.variableSource === 'fault_cases' ? 'count' : 'last';
      }
      if (key === 'variableCode' && !w.variableLabel) w.variableLabel = this.variableLabel(w.variableSource, w.variableCode);
    });
  }

  cancel() {
    this.#router.navigate(['reporting/templates']).then();
  }

  save() {
    this.submitted.set(true);
    if (!this.valid()) return;
    this.saving.set(true);
    const d = this.draft();
    const template = new ReportTemplate({
      id: this.editingId() ?? 0, organizationId: this.iam.organizationId()!, ownerUserId: this.iam.userId()!, status: 'active', ...d,
      sections: d.sections.map(s => ({...s, title: s.title.trim(), widgets: s.widgets.map(w => ({...w, variableCode: w.variableCode.trim(), variableLabel: w.variableLabel.trim()}))}))
    });
    const done = () => { this.saving.set(false); this.cancel(); };
    if (this.editingId()) this.store.updateTemplate(template, done);
    else this.store.addTemplate(template, done);
    setTimeout(() => this.saving.set(false), 4000);
  }
}
