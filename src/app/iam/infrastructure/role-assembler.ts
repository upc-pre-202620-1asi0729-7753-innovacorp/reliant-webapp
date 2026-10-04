import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Role} from '../domain/model/role.entity';
import {RoleResource, RolesResponse} from './roles-response';

export class RoleAssembler implements BaseAssembler<Role, RoleResource, RolesResponse> {
  toEntitiesFromResponse(response: RolesResponse): Role[] {
    return response.roles.map(r => this.toEntityFromResource(r));
  }
  toEntityFromResource(r: RoleResource): Role {
    return new Role({ id: r.id, name: r.name });
  }
  toResourceFromEntity(e: Role): RoleResource {
    return { id: e.id, name: e.name } as RoleResource;
  }
}
