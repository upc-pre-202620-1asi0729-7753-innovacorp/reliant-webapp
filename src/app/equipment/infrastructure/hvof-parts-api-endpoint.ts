import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HvofPart} from '../domain/model/hvof-part.entity';
import {HvofPartResource, HvofPartsResponse} from './hvof-parts-response';
import {HvofPartAssembler} from './hvof-part-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

export class HvofPartsApiEndpoint extends BaseApiEndpoint<HvofPart, HvofPartResource, HvofPartsResponse, HvofPartAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderHvofPartsEndpointPath}`, new HvofPartAssembler());
  }
}
