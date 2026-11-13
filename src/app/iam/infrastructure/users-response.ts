import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

export interface UsersResponse extends BaseResponse { users: UserResource[]; }

/** The platform exposes the roles of a user as `roles: [{id, name}]`. */
export interface UserResource extends BaseResource {
  id: number;
  fullName: string;
  email: string;
  organizationId: number;
  status?: string;
  roles?: { id: number; name: string }[];
  roleIds?: { roleId: number }[];
}
