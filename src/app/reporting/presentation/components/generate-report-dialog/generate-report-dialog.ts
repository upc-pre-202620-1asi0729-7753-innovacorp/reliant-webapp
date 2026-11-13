import {Component, computed, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {LowerCasePipe, UpperCasePipe} from '@angular/common';
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {TranslatePipe} from '@ngx-translate/core';
import {ReportingStore} from '../../../application/reporting.store';
import {ReportDataService} from '../../../application/report-data.service';
import {ReportPdfService} from '../../../application/report-pdf.service';
import {IamStore} from '../../../../iam/application/iam.store';
import {GeneratedReport} from '../../../domain/model/generated-report.entity';
import {ReportKind} from '../../../domain/model/report-template.entity';

export interface GenerateReportDialogData {
  sessionId: number;
}

/**
 * Picks a template, renders the PDF of a spray session in the browser, downloads it and registers it in the platform.
 */
@Component({
  selector: 'app-generate-report-dialog',
  imports: [FormsModule, MatDialogModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule, MatProgressSpinner, TranslatePipe, UpperCasePipe, LowerCasePipe],
  templateUrl: './generate-report-dialog.html',
  styleUrl: './generate-report-dialog.css'
})
export class GenerateReportDialog {
  readonly data = inject<GenerateReportDialogData>(MAT_DIALOG_DATA);
  readonly #ref = inject(MatDialogRef<GenerateReportDialog>);
  readonly store = inject(ReportingStore);
  readonly #dataService = inject(ReportDataService);
  readonly #pdf = inject(ReportPdfService);
  readonly #iam = inject(IamStore);

  readonly kind = signal<ReportKind>('session_report');
  readonly templateId = signal<number | null>(null);
  readonly templates = computed(() => this.store.templatesOfKind(this.kind()));
  readonly selected = computed(() => this.templates().find(t => t.id === this.templateId()) ?? this.store.defaultTemplateOf(this.kind()));
  readonly generating = signal(false);
  readonly error = signal<string | null>(null);
  readonly kinds: ReportKind[] = ['session_report', 'quality_certificate', 'fault_summary'];

  constructor() {
    if (!this.store.templatesLoaded()) this.store.loadTemplates();
  }

  setKind(kind: ReportKind) {
    this.kind.set(kind);
    this.templateId.set(null);
  }

  generate() {
    const template = this.selected();
    if (!template) return;
    this.generating.set(true);
    this.error.set(null);
    this.#dataService.contextOfSession(this.data.sessionId).subscribe({
      next: context => {
        try {
          const {doc, fileName} = this.#pdf.render(template, context);
          doc.save(fileName);
          const day = (d: string | null) => d ? d.slice(0, 10) : null;
          const report = new GeneratedReport({
            id: 0, reportTemplateId: template.id, organizationId: this.#iam.organizationId()!, generatedByUserId: this.#iam.userId()!,
            subjectType: 'spray_session', subjectId: context.session.id, format: 'PDF', fileName,
            periodFrom: day(context.session.startedAt), periodTo: day(context.session.endedAt ?? context.session.startedAt), generatedAt: new Date().toISOString()
          });
          this.store.registerGeneratedReport(report, saved => {
            this.generating.set(false);
            this.#ref.close(saved);
          });
        } catch (e) {
          this.error.set(e instanceof Error ? e.message : 'Failed to render PDF');
          this.generating.set(false);
        }
      },
      error: (err: Error) => {
        this.error.set(err.message);
        this.generating.set(false);
      }
    });
  }

  cancel() {
    this.#ref.close(null);
  }
}
