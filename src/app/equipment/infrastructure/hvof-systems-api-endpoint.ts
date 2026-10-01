import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HvofSystem} from '../domain/model/hvof-system.entity';
import {HvofSystemResource, HvofSystemsResponse} from './hvof-systems-response';
import {HvofSystemAssembler} from './hvof-system-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

export class HvofSystemsApiEndpoint extends BaseApiEndpoint<HvofSystem, HvofSystemResource, HvofSystemsResponse, HvofSystemAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderHvofSystemsEndpointPath}`, new HvofSystemAssembler());
  }
}
