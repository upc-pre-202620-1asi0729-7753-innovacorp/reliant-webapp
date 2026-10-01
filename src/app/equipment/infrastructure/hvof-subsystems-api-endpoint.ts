import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {HvofSubsystem} from '../domain/model/hvof-subsystem.entity';
import {HvofSubsystemResource, HvofSubsystemsResponse} from './hvof-subsystems-response';
import {HvofSubsystemAssembler} from './hvof-subsystem-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

export class HvofSubsystemsApiEndpoint extends BaseApiEndpoint<HvofSubsystem, HvofSubsystemResource, HvofSubsystemsResponse, HvofSubsystemAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderHvofSubsystemsEndpointPath}`, new HvofSubsystemAssembler());
  }
}
