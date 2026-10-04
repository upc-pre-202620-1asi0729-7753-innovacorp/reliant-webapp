import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Recuperation} from '../domain/model/recuperation.entity';
import {RecuperationResource, RecuperationsResponse} from './recuperations-response';

export class RecuperationAssembler implements BaseAssembler<Recuperation, RecuperationResource, RecuperationsResponse> {
  toEntitiesFromResponse(response: RecuperationsResponse): Recuperation[] {
    return response.recuperations.map(resource => this.toEntityFromResource(resource as RecuperationResource));
  }

  toEntityFromResource(resource: RecuperationResource): Recuperation {
    return new Recuperation({
      id: resource.id,
      workOrderNumber: resource.workOrderNumber,
      manufacturingOrderNumber: resource.manufacturingOrderNumber,
      componentId: resource.componentId,
      customerId: resource.customerId,
      supplierOrganizationId: resource.supplierOrganizationId,
      segment: resource.segment,
      operation: resource.operation,
      weightValue: resource.weightValue,
      weightUnitSymbol: resource.weightUnitSymbol,
      hourmeterAtEntry: resource.hourmeterAtEntry,
      powderSupplier: resource.powderSupplier,
      powderLotNumber: resource.powderLotNumber,
      powderChemicalComposition: resource.powderChemicalComposition,
      status: resource.status,
      receivedAt: resource.receivedAt,
      completedAt: resource.completedAt ?? null,
      linkedSessions: resource.linkedSessions ?? []
    });
  }

  toResourceFromEntity(entity: Recuperation): RecuperationResource {
    return {
      id: entity.id,
      workOrderNumber: entity.workOrderNumber,
      manufacturingOrderNumber: entity.manufacturingOrderNumber,
      componentId: entity.componentId,
      customerId: entity.customerId,
      supplierOrganizationId: entity.supplierOrganizationId,
      segment: entity.segment,
      operation: entity.operation,
      weightValue: entity.weightValue,
      weightUnitSymbol: entity.weightUnitSymbol,
      hourmeterAtEntry: entity.hourmeterAtEntry,
      powderSupplier: entity.powderSupplier,
      powderLotNumber: entity.powderLotNumber,
      powderChemicalComposition: entity.powderChemicalComposition,
      status: entity.status,
      receivedAt: entity.receivedAt,
      completedAt: entity.completedAt,
      linkedSessions: entity.linkedSessions
    } as RecuperationResource;
  }
}
