import {OrganizationType} from '../domain/model/organization.entity';

export interface SignUpRequest {
  organizationName: string;
  ruc: string;
  organizationType: OrganizationType;
  fullName: string;
  email: string;
  password: string;
}
