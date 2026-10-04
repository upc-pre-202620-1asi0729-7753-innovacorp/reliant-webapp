import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {SubsystemType} from '../domain/model/hvof-subsystem.entity';

export interface HvofSubsystemsResponse extends BaseResponse { hvofSubsystems: HvofSubsystemResource[]; }

export interface HvofSubsystemResource extends BaseResource {
  id: number;
  hvofSystemId: number;
  subsystemType: SubsystemType;
  name: string;
  alias: string;
  parameters: { parameter: string }[];
}
