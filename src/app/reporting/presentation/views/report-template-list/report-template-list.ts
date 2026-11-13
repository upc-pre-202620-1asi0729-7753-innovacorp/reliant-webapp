import {Component, computed, inject} from '@angular/core';
import {Router} from '@angular/router';
import {LowerCasePipe, UpperCasePipe} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatError} from '@angular/material/form-field';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {TranslatePipe} from '@ngx-translate/core';
import {ReportingStore} from '../../../application/reporting.store';
import {IamStore, ROLE} from '../../../../iam/application/iam.store';
import {TemplatePreview} from '../../components/template-preview/template-preview';

@Component({
  selector: 'app-report-template-list',
  imports: [MatButtonModule, MatIconModule, MatError, MatProgressSpinner, TranslatePipe, TemplatePreview, UpperCasePipe, LowerCasePipe],
  templateUrl: './report-template-list.html',
  styleUrl: './report-template-list.css'
})
export class ReportTemplateList {
  readonly store = inject(ReportingStore);
  readonly iam = inject(IamStore);
  readonly #router = inject(Router);
  readonly canEdit = computed(() => this.iam.hasRole(ROLE.ORG_ADMIN, ROLE.QUALITY_ENGINEER));
  readonly sorted = computed(() => [...this.store.templates()].sort((a, b) =>
    Number(b.isActive) - Number(a.isActive) || a.reportKind.localeCompare(b.reportKind) || Number(b.defaultForKind) - Number(a.defaultForKind) || a.name.localeCompare(b.name)));

  constructor() {
    this.store.loadTemplates();
  }

  newTemplate() {
    this.#router.navigate(['reporting/templates/new']).then();
  }

  edit(id: number) {
    this.#router.navigate(['reporting/templates', id, 'edit']).then();
  }

  toggleStatus(id: number, active: boolean) {
    this.store.changeTemplateStatus(id, active ? 'archived' : 'active');
  }

  generated() {
    this.#router.navigate(['reporting/generated']).then();
  }
}
