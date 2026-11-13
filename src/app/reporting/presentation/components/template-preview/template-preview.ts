import {Component, computed, input} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {isFullWidth, ReportSection, ReportWidget} from '../../../domain/model/report-template.entity';

export interface PreviewTemplate {
  name: string;
  headerText: string;
  footerText: string;
  primaryColor: string;
  secondaryColor: string;
  orientation: string;
  showSignatureBlock: boolean;
  sections: ReportSection[];
}

/** Miniature of how a template lays out on the page, updated as the form changes. */
@Component({
  selector: 'app-template-preview',
  imports: [TranslatePipe],
  templateUrl: './template-preview.html',
  styleUrl: './template-preview.css'
})
export class TemplatePreview {
  readonly template = input.required<PreviewTemplate>();
  readonly landscape = computed(() => this.template().orientation === 'landscape');
  readonly sections = computed(() => [...this.template().sections].sort((a, b) => a.sectionOrder - b.sectionOrder));

  isFull(w: ReportWidget): boolean {
    return isFullWidth(w);
  }
}
