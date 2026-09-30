import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {ComponentStatus, ComponentType} from '../domain/model/component.entity';

export interface ComponentsResponse extends BaseResponse {
  components: ComponentResource[];
}

export interface ComponentResource extends BaseResource {
  id: number;
  serialNumber: string;
  partNumber: string;
  componentType: ComponentType;
  machineManufacturer: string;
  machineModel: string;
  customerId: number;
  pcrTargetHours: number;
  status: ComponentStatus;
}
