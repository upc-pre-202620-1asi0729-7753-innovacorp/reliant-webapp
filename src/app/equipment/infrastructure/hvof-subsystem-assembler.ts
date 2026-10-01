import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {HvofSubsystem} from '../domain/model/hvof-subsystem.entity';
import {HvofSubsystemResource, HvofSubsystemsResponse} from './hvof-subsystems-response';

export class HvofSubsystemAssembler implements BaseAssembler<HvofSubsystem, HvofSubsystemResource, HvofSubsystemsResponse> {
  toEntitiesFromResponse(response: HvofSubsystemsResponse): HvofSubsystem[] {
    return response.hvofSubsystems.map(r => this.toEntityFromResource(r));
  }
  toEntityFromResource(r: HvofSubsystemResource): HvofSubsystem {
    return new HvofSubsystem({ id: r.id, hvofSystemId: r.hvofSystemId, subsystemType: r.subsystemType, name: r.name, alias: r.alias, parameters: r.parameters ?? [] });
  }
  toResourceFromEntity(e: HvofSubsystem): HvofSubsystemResource {
    return { id: e.id, hvofSystemId: e.hvofSystemId, subsystemType: e.subsystemType, name: e.name, alias: e.alias, parameters: e.parameters } as HvofSubsystemResource;
  }
}
