import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';

export interface CustomersResponse extends BaseResponse {
  customers: CustomerResource[];
}

export interface CustomerResource extends BaseResource {
  id: number;
  supplierOrganizationId: number;
  linkedAssetOwnerOrganizationId: number | null;
  legalName: string;
  ruc: string;
  mineSite: string;
}
