import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {ProcessReading} from '../domain/model/process-reading.entity';
import {ProcessReadingResource, ProcessReadingsResponse} from './process-readings-response';

export class ProcessReadingAssembler implements BaseAssembler<ProcessReading, ProcessReadingResource, ProcessReadingsResponse> {
  toEntitiesFromResponse(response: ProcessReadingsResponse): ProcessReading[] {
    return response.processReadings.map(r => this.toEntityFromResource(r));
  }
  toEntityFromResource(r: ProcessReadingResource): ProcessReading {
    return new ProcessReading({
      id: r.id, spraySessionId: r.spraySessionId, epochMillis: r.epochMillis, plcClockOffsetMillis: r.plcClockOffsetMillis ?? 0,
      tagPath: r.tagPath, parameter: r.parameter, subsystemId: r.subsystemId ?? null, partId: r.partId ?? null,
      value: r.value, unitSymbol: r.unitSymbol, unitCategory: r.unitCategory, band: r.band,
      derived: r.derived ?? false, mappingPending: r.mappingPending ?? false
    });
  }
  toResourceFromEntity(e: ProcessReading): ProcessReadingResource {
    return {
      id: e.id, spraySessionId: e.spraySessionId, epochMillis: e.epochMillis, plcClockOffsetMillis: e.plcClockOffsetMillis,
      tagPath: e.tagPath, parameter: e.parameter, subsystemId: e.subsystemId, partId: e.partId,
      value: e.value, unitSymbol: e.unitSymbol, unitCategory: e.unitCategory, band: e.band,
      derived: e.derived, mappingPending: e.mappingPending
    } as ProcessReadingResource;
  }
}
