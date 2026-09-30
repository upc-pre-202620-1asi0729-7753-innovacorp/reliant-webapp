import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {RecoveredComponent} from '../domain/model/component.entity';
import {ComponentResource, ComponentsResponse} from './components-response';

export class ComponentAssembler implements BaseAssembler<RecoveredComponent, ComponentResource, ComponentsResponse> {
  toEntitiesFromResponse(response: ComponentsResponse): RecoveredComponent[] {
    return response.components.map(resource => this.toEntityFromResource(resource as ComponentResource));
  }

  toEntityFromResource(resource: ComponentResource): RecoveredComponent {
    return new RecoveredComponent({
      id: resource.id,
      serialNumber: resource.serialNumber,
      partNumber: resource.partNumber,
      componentType: resource.componentType,
      machineManufacturer: resource.machineManufacturer,
      machineModel: resource.machineModel,
      customerId: resource.customerId,
      pcrTargetHours: resource.pcrTargetHours,
      status: resource.status
    });
  }

  toResourceFromEntity(entity: RecoveredComponent): ComponentResource {
    return {
      id: entity.id,
      serialNumber: entity.serialNumber,
      partNumber: entity.partNumber,
      componentType: entity.componentType,
      machineManufacturer: entity.machineManufacturer,
      machineModel: entity.machineModel,
      customerId: entity.customerId,
      pcrTargetHours: entity.pcrTargetHours,
      status: entity.status
    } as ComponentResource;
  }
}
