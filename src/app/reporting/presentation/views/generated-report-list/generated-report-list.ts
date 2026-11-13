import {Component, computed, inject} from '@angular/core';
import {Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatError} from '@angular/material/form-field';
import {TranslatePipe} from '@ngx-translate/core';
import {ReportingStore} from '../../../application/reporting.store';
import {IamStore} from '../../../../iam/application/iam.store';

@Component({
  selector: 'app-generated-report-list',
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatError, TranslatePipe, DatePipe],
  templateUrl: './generated-report-list.html',
  styleUrl: './generated-report-list.css'
})
export class GeneratedReportList {
  readonly store = inject(ReportingStore);
  readonly iam = inject(IamStore);
  readonly #router = inject(Router);
  readonly displayedColumns = ['generatedAt', 'fileName', 'template', 'subject', 'generatedBy', 'actions'];
  readonly sorted = computed(() => [...this.store.generatedReports()].sort((a, b) => b.generatedAt.localeCompare(a.generatedAt)));

  constructor() {
    this.store.loadGeneratedReports();
  }

  openSubject(subjectType: string, subjectId: number) {
    if (subjectType === 'spray_session') this.#router.navigate(['process-monitoring/spray-sessions', subjectId, 'report']).then();
    else this.#router.navigate(['traceability/recuperations']).then();
  }

  templates() {
    this.#router.navigate(['reporting/templates']).then();
  }
}
