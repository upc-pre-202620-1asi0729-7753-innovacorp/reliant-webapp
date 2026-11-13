import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {User} from '../domain/model/user.entity';
import {UserResource, UsersResponse} from './users-response';

export class UserAssembler implements BaseAssembler<User, UserResource, UsersResponse> {
  toEntitiesFromResponse(response: UsersResponse): User[] {
    return response.users.map(r => this.toEntityFromResource(r));
  }

  toEntityFromResource(r: UserResource): User {
    const roleIds = r.roleIds ?? (r.roles ?? []).map(role => ({roleId: role.id}));
    return new User({id: r.id, fullName: r.fullName, email: r.email, organizationId: r.organizationId, status: r.status ?? 'ACTIVE', roleIds});
  }

  toResourceFromEntity(e: User): UserResource {
    return {id: e.id, fullName: e.fullName, email: e.email, organizationId: e.organizationId, status: e.status, roleIds: e.roleIds} as UserResource;
  }
}
