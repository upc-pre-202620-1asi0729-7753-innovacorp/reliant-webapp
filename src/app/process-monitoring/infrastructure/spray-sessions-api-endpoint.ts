import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {SpraySession} from '../domain/model/spray-session.entity';
import {SpraySessionResource, SpraySessionsResponse} from './spray-sessions-response';
import {SpraySessionAssembler} from './spray-session-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

export class SpraySessionsApiEndpoint extends BaseApiEndpoint<SpraySession, SpraySessionResource, SpraySessionsResponse, SpraySessionAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderSpraySessionsEndpointPath}`, new SpraySessionAssembler());
  }
}
