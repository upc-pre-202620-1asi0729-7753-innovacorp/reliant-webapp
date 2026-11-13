import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {ReportTemplate, TemplateStatus} from '../domain/model/report-template.entity';
import {ReportTemplateResource, ReportTemplatesResponse} from './report-templates-response';
import {ReportTemplateAssembler} from './report-template-assembler';

export class ReportTemplatesApiEndpoint extends BaseApiEndpoint<ReportTemplate, ReportTemplateResource, ReportTemplatesResponse, ReportTemplateAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderReportTemplatesEndpointPath}`, new ReportTemplateAssembler());
  }

  changeStatus(reportTemplateId: number, status: TemplateStatus): Observable<ReportTemplate> {
    return this.http.patch<ReportTemplateResource>(`${this.endpointUrl}/${reportTemplateId}/status`, {status}).pipe(
      map(r => this.assembler.toEntityFromResource(r)),
      catchError(this.handleError('Failed to change template status'))
    );
  }
}
