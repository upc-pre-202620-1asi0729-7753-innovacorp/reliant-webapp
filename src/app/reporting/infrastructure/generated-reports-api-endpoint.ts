import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {GeneratedReport} from '../domain/model/generated-report.entity';
import {GeneratedReportResource, GeneratedReportsResponse} from './generated-reports-response';
import {GeneratedReportAssembler} from './generated-report-assembler';

export class GeneratedReportsApiEndpoint extends BaseApiEndpoint<GeneratedReport, GeneratedReportResource, GeneratedReportsResponse, GeneratedReportAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderGeneratedReportsEndpointPath}`, new GeneratedReportAssembler());
  }
}
