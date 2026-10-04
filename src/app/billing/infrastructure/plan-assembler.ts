import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Plan} from '../domain/model/plan.entity';
import {PlanResource, PlansResponse} from './plans-response';

export class PlanAssembler implements BaseAssembler<Plan, PlanResource, PlansResponse> {
  toEntitiesFromResponse(response: PlansResponse): Plan[] { return response.plans.map(r => this.toEntityFromResource(r)); }
  toEntityFromResource(r: PlanResource): Plan { return new Plan({...r}); }
  toResourceFromEntity(e: Plan): PlanResource {
    return { id: e.id, name: e.name, planType: e.planType, monthlyPriceAmount: e.monthlyPriceAmount, monthlyPriceCurrency: e.monthlyPriceCurrency, maxMonitoredSystems: e.maxMonitoredSystems, maxTrackedComponents: e.maxTrackedComponents };
  }
}
