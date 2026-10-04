import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Customer} from '../domain/model/customer.entity';
import {CustomerResource, CustomersResponse} from './customers-response';

export class CustomerAssembler implements BaseAssembler<Customer, CustomerResource, CustomersResponse> {
  toEntitiesFromResponse(response: CustomersResponse): Customer[] {
    return response.customers.map(resource => this.toEntityFromResource(resource as CustomerResource));
  }

  toEntityFromResource(resource: CustomerResource): Customer {
    return new Customer({
      id: resource.id,
      supplierOrganizationId: resource.supplierOrganizationId,
      linkedAssetOwnerOrganizationId: resource.linkedAssetOwnerOrganizationId ?? null,
      legalName: resource.legalName,
      ruc: resource.ruc,
      mineSite: resource.mineSite
    });
  }

  toResourceFromEntity(entity: Customer): CustomerResource {
    return {
      id: entity.id,
      supplierOrganizationId: entity.supplierOrganizationId,
      linkedAssetOwnerOrganizationId: entity.linkedAssetOwnerOrganizationId,
      legalName: entity.legalName,
      ruc: entity.ruc,
      mineSite: entity.mineSite
    } as CustomerResource;
  }
}
