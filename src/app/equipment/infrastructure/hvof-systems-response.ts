import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {FuelType, HvofSystemStatus, TagMapping} from '../domain/model/hvof-system.entity';

export interface HvofSystemsResponse extends BaseResponse {
  hvofSystems: HvofSystemResource[];
}

export interface HvofSystemResource extends BaseResource {
  id: number;
  code: string;
  organizationId: number;
  serialNumber: string;
  status: HvofSystemStatus;
  systemManufacturer: string;
  systemModel: string;
  fuelType: FuelType;
  tagMappings: TagMapping[];
}
