import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {FaultRule} from '../domain/model/fault-rule.entity';
import {FaultRuleResource, FaultRulesResponse} from './fault-rules-response';

export class FaultRuleAssembler implements BaseAssembler<FaultRule, FaultRuleResource, FaultRulesResponse> {
  toEntitiesFromResponse(response: FaultRulesResponse): FaultRule[] {
    return response.faultRules.map(r => this.toEntityFromResource(r));
  }

  toEntityFromResource(r: FaultRuleResource): FaultRule {
    return new FaultRule({id: r.id, organizationId: r.organizationId, parameter: r.parameter, band: r.band, probableCause: r.probableCause,
      recommendedAction: r.recommendedAction, cooldownSeconds: r.cooldownSeconds});
  }

  toResourceFromEntity(e: FaultRule): FaultRuleResource {
    return {id: e.id, organizationId: e.organizationId, parameter: e.parameter, band: e.band, probableCause: e.probableCause,
      recommendedAction: e.recommendedAction, cooldownSeconds: e.cooldownSeconds};
  }
}
