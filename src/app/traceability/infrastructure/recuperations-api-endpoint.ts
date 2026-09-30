import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {Recuperation} from '../domain/model/recuperation.entity';
import {RecuperationResource, RecuperationsResponse} from './recuperations-response';
import {RecuperationAssembler} from './recuperation-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

export class RecuperationsApiEndpoint extends BaseApiEndpoint<Recuperation, RecuperationResource, RecuperationsResponse, RecuperationAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderRecuperationsEndpointPath}`, new RecuperationAssembler());
  }
}
