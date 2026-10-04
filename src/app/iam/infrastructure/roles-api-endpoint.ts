import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {Role} from '../domain/model/role.entity';
import {RoleResource, RolesResponse} from './roles-response';
import {RoleAssembler} from './role-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

export class RolesApiEndpoint extends BaseApiEndpoint<Role, RoleResource, RolesResponse, RoleAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}/roles`, new RoleAssembler());
  }
}
