import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {RecoveredComponent} from '../domain/model/component.entity';
import {ComponentResource, ComponentsResponse} from './components-response';
import {ComponentAssembler} from './component-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

export class ComponentsApiEndpoint extends BaseApiEndpoint<RecoveredComponent, ComponentResource, ComponentsResponse, ComponentAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderComponentsEndpointPath}`, new ComponentAssembler());
  }
}
