import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

export interface UsersResponse extends BaseResponse { users: UserResource[]; }

export interface UserResource extends BaseResource {
  id: number;
  fullName: string;
  email: string;
  organizationId: number;
  status: string;
  roleIds: { roleId: number }[];
  password?: string;
}
