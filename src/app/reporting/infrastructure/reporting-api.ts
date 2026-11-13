import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {ReportTemplate, TemplateStatus} from '../domain/model/report-template.entity';
import {GeneratedReport} from '../domain/model/generated-report.entity';
import {ReportTemplatesApiEndpoint} from './report-templates-api-endpoint';
import {GeneratedReportsApiEndpoint} from './generated-reports-api-endpoint';

@Injectable({providedIn: 'root'})
export class ReportingApi extends BaseApi {
  readonly #templatesEndpoint = new ReportTemplatesApiEndpoint(this.http);
  readonly #reportsEndpoint = new GeneratedReportsApiEndpoint(this.http);

  /** The platform seeds the standard templates of the organization on the first call. */
  getTemplates(): Observable<ReportTemplate[]> {
    return this.#templatesEndpoint.getAll();
  }

  createTemplate(template: ReportTemplate): Observable<ReportTemplate> {
    return this.#templatesEndpoint.create(template);
  }

  updateTemplate(template: ReportTemplate): Observable<ReportTemplate> {
    return this.#templatesEndpoint.update(template, template.id);
  }

  changeTemplateStatus(id: number, status: TemplateStatus): Observable<ReportTemplate> {
    return this.#templatesEndpoint.changeStatus(id, status);
  }

  getGeneratedReports(): Observable<GeneratedReport[]> {
    return this.#reportsEndpoint.getAll();
  }

  registerGeneratedReport(report: GeneratedReport): Observable<GeneratedReport> {
    return this.#reportsEndpoint.create(report);
  }
}
