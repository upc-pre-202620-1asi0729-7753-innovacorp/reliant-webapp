import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {HvofPart} from '../domain/model/hvof-part.entity';
import {HvofPartResource, HvofPartsResponse} from './hvof-parts-response';

export class HvofPartAssembler implements BaseAssembler<HvofPart, HvofPartResource, HvofPartsResponse> {
  toEntitiesFromResponse(response: HvofPartsResponse): HvofPart[] {
    return response.hvofParts.map(r => this.toEntityFromResource(r));
  }
  toEntityFromResource(r: HvofPartResource): HvofPart {
    return new HvofPart({ id: r.id, hvofSubsystemId: r.hvofSubsystemId, partType: r.partType, serialNumber: r.serialNumber, manufacturer: r.manufacturer });
  }
  toResourceFromEntity(e: HvofPart): HvofPartResource {
    return { id: e.id, hvofSubsystemId: e.hvofSubsystemId, partType: e.partType, serialNumber: e.serialNumber, manufacturer: e.manufacturer } as HvofPartResource;
  }
}
