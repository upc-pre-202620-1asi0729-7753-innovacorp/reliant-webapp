import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {Band} from '../domain/model/process-reading.entity';

export interface ProcessReadingsResponse extends BaseResponse { processReadings: ProcessReadingResource[]; }

export interface ProcessReadingResource extends BaseResource {
  id: number;
  spraySessionId: number;
  epochMillis: number;
  plcClockOffsetMillis: number;
  tagPath: string;
  parameter: string;
  subsystemId: number | null;
  partId: number | null;
  value: number;
  unitSymbol: string;
  unitCategory: string;
  band: Band;
  derived: boolean;
  mappingPending: boolean;
}
