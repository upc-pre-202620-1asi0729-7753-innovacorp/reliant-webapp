import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Controller} from '../domain/model/controller.entity';
import {ControllerResource, ControllersResponse} from './controllers-response';

export class ControllerAssembler implements BaseAssembler<Controller, ControllerResource, ControllersResponse> {
  toEntitiesFromResponse(response: ControllersResponse): Controller[] {
    return response.controllers.map(resource => this.toEntityFromResource(resource as ControllerResource));
  }

  toEntityFromResource(r: ControllerResource): Controller {
    return new Controller({
      id: r.id, hvofSystemId: r.hvofSystemId, controllerNumber: r.controllerNumber, deviceType: r.deviceType,
      serialNumber: r.serialNumber, manufacturer: r.manufacturer, model: r.model, partNumber: r.partNumber,
      ipAddress: r.ipAddress, port: r.port, rack: r.rack, slot: r.slot, endpointUrl: r.endpointUrl ?? null,
      tagCatalogId: r.tagCatalogId ?? null, supportedProtocols: r.supportedProtocols ?? []
    });
  }

  toResourceFromEntity(e: Controller): ControllerResource {
    return {
      id: e.id, hvofSystemId: e.hvofSystemId, controllerNumber: e.controllerNumber, deviceType: e.deviceType,
      serialNumber: e.serialNumber, manufacturer: e.manufacturer, model: e.model, partNumber: e.partNumber,
      ipAddress: e.ipAddress, port: e.port, rack: e.rack, slot: e.slot, endpointUrl: e.endpointUrl,
      tagCatalogId: e.tagCatalogId, supportedProtocols: e.supportedProtocols
    } as ControllerResource;
  }
}
