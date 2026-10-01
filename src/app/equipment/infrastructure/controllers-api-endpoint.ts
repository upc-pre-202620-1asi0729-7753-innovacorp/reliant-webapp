import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {Controller} from '../domain/model/controller.entity';
import {ControllerResource, ControllersResponse} from './controllers-response';
import {ControllerAssembler} from './controller-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

export class ControllersApiEndpoint extends BaseApiEndpoint<Controller, ControllerResource, ControllersResponse, ControllerAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderControllersEndpointPath}`, new ControllerAssembler());
  }
}
