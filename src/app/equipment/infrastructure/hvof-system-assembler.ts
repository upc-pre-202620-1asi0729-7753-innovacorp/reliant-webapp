import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {HvofSystem} from '../domain/model/hvof-system.entity';
import {HvofSystemResource, HvofSystemsResponse} from './hvof-systems-response';

export class HvofSystemAssembler implements BaseAssembler<HvofSystem, HvofSystemResource, HvofSystemsResponse> {
  toEntitiesFromResponse(response: HvofSystemsResponse): HvofSystem[] {
    return response.hvofSystems.map(resource => this.toEntityFromResource(resource as HvofSystemResource));
  }

  toEntityFromResource(resource: HvofSystemResource): HvofSystem {
    return new HvofSystem({
      id: resource.id,
      code: resource.code,
      organizationId: resource.organizationId,
      serialNumber: resource.serialNumber,
      status: resource.status,
      systemManufacturer: resource.systemManufacturer,
      systemModel: resource.systemModel,
      fuelType: resource.fuelType,
      tagMappings: resource.tagMappings ?? []
    });
  }

  toResourceFromEntity(entity: HvofSystem): HvofSystemResource {
    return {
      id: entity.id,
      code: entity.code,
      organizationId: entity.organizationId,
      serialNumber: entity.serialNumber,
      status: entity.status,
      systemManufacturer: entity.systemManufacturer,
      systemModel: entity.systemModel,
      fuelType: entity.fuelType,
      tagMappings: entity.tagMappings
    } as HvofSystemResource;
  }
}
