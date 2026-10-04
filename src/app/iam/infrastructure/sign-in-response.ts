import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {OrganizationType} from '../domain/model/organization.entity';

export interface SignInResponse extends BaseResponse, SignInResource {}

export interface SignInResource extends BaseResource {
  id: number;
  email: string;
  fullName: string;
  organizationId: number;
  organizationType: OrganizationType;
  roleIds: { roleId: number }[];
  token: string;
}
