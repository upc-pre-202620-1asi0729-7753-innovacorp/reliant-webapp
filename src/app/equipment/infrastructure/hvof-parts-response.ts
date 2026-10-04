import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {PartType} from '../domain/model/hvof-part.entity';

export interface HvofPartsResponse extends BaseResponse { hvofParts: HvofPartResource[]; }

export interface HvofPartResource extends BaseResource {
  id: number;
  hvofSubsystemId: number;
  partType: PartType;
  serialNumber: string;
  manufacturer: string;
}
