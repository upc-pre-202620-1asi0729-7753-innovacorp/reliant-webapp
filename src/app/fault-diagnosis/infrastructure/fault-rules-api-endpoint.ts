import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { environment } from '../../../environments/environment';
import { FaultRule } from '../domain/model/fault-rule.entity';
import { FaultRuleResource, FaultRulesResponse } from './fault-rules-response';
import { FaultRuleAssembler } from './fault-rule-assembler';

export class FaultRulesApiEndpoint extends BaseApiEndpoint<
  FaultRule,
  FaultRuleResource,
  FaultRulesResponse,
  FaultRuleAssembler
> {
  constructor(http: HttpClient) {
    super(
      http,
      `${environment.platformProviderApiBaseUrl}${environment.platformProviderFaultRulesEndpointPath}`,
      new FaultRuleAssembler(),
    );
  }

  restoreDefaults(): Observable<FaultRule[]> {
    return this.http.post<FaultRuleResource[]>(`${this.endpointUrl}/defaults`, {}).pipe(
      map((resources) =>
        resources.map((resource) => this.assembler.toEntityFromResource(resource)),
      ),
      catchError(this.handleError('Failed to restore default fault rules')),
    );
  }
}
