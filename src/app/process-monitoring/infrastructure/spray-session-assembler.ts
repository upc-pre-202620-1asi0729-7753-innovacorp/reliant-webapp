import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {SpraySession} from '../domain/model/spray-session.entity';
import {SpraySessionResource, SpraySessionsResponse} from './spray-sessions-response';

export class SpraySessionAssembler implements BaseAssembler<SpraySession, SpraySessionResource, SpraySessionsResponse> {
  toEntitiesFromResponse(response: SpraySessionsResponse): SpraySession[] {
    return response.spraySessions.map(r => this.toEntityFromResource(r));
  }
  toEntityFromResource(r: SpraySessionResource): SpraySession {
    return new SpraySession({
      id: r.id, hvofSystemId: r.hvofSystemId, recuperationId: r.recuperationId, operatorId: r.operatorId,
      recipeNumber: r.recipeNumber, startedAt: r.startedAt, endedAt: r.endedAt ?? null, timeZone: r.timeZone,
      status: r.status, abortReason: r.abortReason ?? null
    });
  }
  toResourceFromEntity(e: SpraySession): SpraySessionResource {
    return {
      id: e.id, hvofSystemId: e.hvofSystemId, recuperationId: e.recuperationId, operatorId: e.operatorId,
      recipeNumber: e.recipeNumber, startedAt: e.startedAt, endedAt: e.endedAt, timeZone: e.timeZone,
      status: e.status, abortReason: e.abortReason
    } as SpraySessionResource;
  }
}
