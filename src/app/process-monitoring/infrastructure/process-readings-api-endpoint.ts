import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {ProcessReading} from '../domain/model/process-reading.entity';
import {ProcessReadingResource, ProcessReadingsResponse} from './process-readings-response';
import {ProcessReadingAssembler} from './process-reading-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

export class ProcessReadingsApiEndpoint extends BaseApiEndpoint<ProcessReading, ProcessReadingResource, ProcessReadingsResponse, ProcessReadingAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderProcessReadingsEndpointPath}`, new ProcessReadingAssembler());
  }
}
