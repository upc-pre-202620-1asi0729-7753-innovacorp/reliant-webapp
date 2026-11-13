import {HttpClient} from '@angular/common/http';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {FaultRule} from '../domain/model/fault-rule.entity';
import {FaultRuleResource, FaultRulesResponse} from './fault-rules-response';
import {FaultRuleAssembler} from './fault-rule-assembler';

export class FaultRulesApiEndpoint extends BaseApiEndpoint<FaultRule, FaultRuleResource, FaultRulesResponse, FaultRuleAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderFaultRulesEndpointPath}`, new FaultRuleAssembler());
  }
}
