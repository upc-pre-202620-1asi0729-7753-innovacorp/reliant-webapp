import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {DeviceType, Protocol} from '../domain/model/controller.entity';

export interface ControllersResponse extends BaseResponse {
  controllers: ControllerResource[];
}

export interface ControllerResource extends BaseResource {
  id: number;
  hvofSystemId: number;
  controllerNumber: number;
  deviceType: DeviceType;
  serialNumber: string;
  manufacturer: string;
  model: string;
  partNumber: string;
  ipAddress: string;
  port: number;
  rack: number;
  slot: number;
  endpointUrl: string | null;
  tagCatalogId: number | null;
  supportedProtocols: { protocol: Protocol }[];
}
