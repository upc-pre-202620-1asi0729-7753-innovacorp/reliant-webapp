import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {FaultCase} from '../domain/model/fault-case.entity';
import {FaultCaseResource, FaultCasesResponse} from './fault-cases-response';

export class FaultCaseAssembler implements BaseAssembler<FaultCase, FaultCaseResource, FaultCasesResponse> {
  toEntitiesFromResponse(response: FaultCasesResponse): FaultCase[] {
    return response.faultCases.map(r => this.toEntityFromResource(r));
  }

  toEntityFromResource(r: FaultCaseResource): FaultCase {
    return new FaultCase({
      id: r.id, organizationId: r.organizationId, spraySessionId: r.spraySessionId, hvofSystemId: r.hvofSystemId, parameter: r.parameter,
      band: r.band, value: r.value, epochMillis: r.epochMillis, probableCause: r.probableCause, recommendedAction: r.recommendedAction,
      status: r.status, acknowledgedBy: r.acknowledgedBy ?? null, acknowledgedAt: r.acknowledgedAt ?? null,
      resolvedBy: r.resolvedBy ?? null, resolvedAt: r.resolvedAt ?? null, resolutionNotes: r.resolutionNotes ?? null
    });
  }

  toResourceFromEntity(e: FaultCase): FaultCaseResource {
    return {...e} as FaultCaseResource;
  }
}
