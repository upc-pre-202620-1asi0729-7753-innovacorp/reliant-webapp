import {computed, inject, Injectable, Signal, signal} from '@angular/core';
import {Observable, retry} from 'rxjs';
import {ReportingApi} from '../infrastructure/reporting-api';
import {ReportKind, ReportTemplate, TemplateStatus} from '../domain/model/report-template.entity';
import {GeneratedReport} from '../domain/model/generated-report.entity';
import {IamStore} from '../../iam/application/iam.store';

@Injectable({providedIn: 'root'})
export class ReportingStore {
  readonly #api = inject(ReportingApi);
  readonly #iam = inject(IamStore);

  readonly #templatesSignal = signal<ReportTemplate[]>([]);
  readonly templates = this.#templatesSignal.asReadonly();
  readonly activeTemplates = computed(() => this.templates().filter(t => t.isActive));
  readonly #templatesLoadedSignal = signal(false);
  readonly templatesLoaded = this.#templatesLoadedSignal.asReadonly();

  readonly #reportsSignal = signal<GeneratedReport[]>([]);
  readonly generatedReports = this.#reportsSignal.asReadonly();

  readonly #loadingSignal = signal(false);
  readonly loading = this.#loadingSignal.asReadonly();
  readonly #errorSignal = signal<string | null>(null);
  readonly error = this.#errorSignal.asReadonly();

  constructor() {
    this.reload();
  }

  reload(): void {
    this.#templatesLoadedSignal.set(false);
    if (!this.#iam.organizationId() || !this.#iam.isSupplier()) {
      this.#templatesSignal.set([]);
      this.#reportsSignal.set([]);
      return;
    }
    this.loadTemplates();
    this.loadGeneratedReports();
  }

  loadTemplates(): void {
    this.#loadingSignal.set(true);
    this.#api.getTemplates().subscribe({
      next: templates => {
        this.#templatesSignal.set(templates);
        this.#templatesLoadedSignal.set(true);
        this.#loadingSignal.set(false);
      },
      error: err => {
        this.#errorSignal.set(this.#formatError(err, 'Failed to load report templates'));
        this.#templatesLoadedSignal.set(true);
        this.#loadingSignal.set(false);
      }
    });
  }

  loadGeneratedReports(): void {
    this.#api.getGeneratedReports().subscribe({
      next: reports => this.#reportsSignal.set(reports),
      error: err => this.#errorSignal.set(this.#formatError(err, 'Failed to load generated reports'))
    });
  }

  getTemplateById(id: number): Signal<ReportTemplate | undefined> {
    return computed(() => id ? this.templates().find(t => t.id === id) : undefined);
  }

  templateName(id: number): string {
    return this.templates().find(t => t.id === id)?.name ?? `#${id}`;
  }

  templatesOfKind(kind: ReportKind): ReportTemplate[] {
    return this.activeTemplates().filter(t => t.reportKind === kind);
  }

  defaultTemplateOf(kind: ReportKind): ReportTemplate | undefined {
    const candidates = this.templatesOfKind(kind);
    return candidates.find(t => t.defaultForKind) ?? candidates[0];
  }

  reportsOf(subjectId: number): Signal<GeneratedReport[]> {
    return computed(() => this.generatedReports().filter(r => r.subjectType === 'spray_session' && r.subjectId === subjectId));
  }

  addTemplate(template: ReportTemplate, onDone?: (saved: ReportTemplate) => void): void {
    this.#run(this.#api.createTemplate(template), created => {
      this.#templatesSignal.update(list => [...this.#clearDefault(list, created), created]);
      onDone?.(created);
    }, 'Failed to create report template');
  }

  updateTemplate(template: ReportTemplate, onDone?: (saved: ReportTemplate) => void): void {
    this.#run(this.#api.updateTemplate(template), updated => {
      this.#templatesSignal.update(list => this.#clearDefault(list, updated).map(t => t.id === updated.id ? updated : t));
      onDone?.(updated);
    }, 'Failed to update report template');
  }

  changeTemplateStatus(id: number, status: TemplateStatus): void {
    this.#run(this.#api.changeTemplateStatus(id, status), updated =>
      this.#templatesSignal.update(list => list.map(t => t.id === updated.id ? updated : t)), 'Failed to change template status');
  }

  registerGeneratedReport(report: GeneratedReport, onDone?: (saved: GeneratedReport) => void): void {
    this.#run(this.#api.registerGeneratedReport(report), created => {
      this.#reportsSignal.update(list => [created, ...list]);
      onDone?.(created);
    }, 'Failed to register generated report');
  }

  /** Only one template per kind is the default; the platform clears the others, mirror it locally. */
  #clearDefault(list: ReportTemplate[], saved: ReportTemplate): ReportTemplate[] {
    if (!saved.defaultForKind) return list;
    return list.map(t => {
      if (t.id !== saved.id && t.reportKind === saved.reportKind && t.defaultForKind) t.defaultForKind = false;
      return t;
    });
  }

  #run<T>(request: Observable<T>, onNext: (value: T) => void, fallback: string): void {
    this.#loadingSignal.set(true);
    this.#errorSignal.set(null);
    request.pipe(retry({count: 1, delay: 300})).subscribe({
      next: value => {
        onNext(value);
        this.#loadingSignal.set(false);
      },
      error: err => {
        this.#errorSignal.set(this.#formatError(err, fallback));
        this.#loadingSignal.set(false);
      }
    });
  }

  #formatError(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
  }
}
