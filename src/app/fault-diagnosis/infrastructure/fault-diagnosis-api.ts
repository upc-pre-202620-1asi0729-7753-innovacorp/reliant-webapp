import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {FaultCase} from '../domain/model/fault-case.entity';
import {FaultRule} from '../domain/model/fault-rule.entity';
import {FaultCasesApiEndpoint} from './fault-cases-api-endpoint';
import {FaultRulesApiEndpoint} from './fault-rules-api-endpoint';

@Injectable({providedIn: 'root'})
export class FaultDiagnosisApi extends BaseApi {
  readonly #casesEndpoint = new FaultCasesApiEndpoint(this.http);
  readonly #rulesEndpoint = new FaultRulesApiEndpoint(this.http);

  getFaultCases(): Observable<FaultCase[]> {
    return this.#casesEndpoint.getAll();
  }

  getFaultCasesBySessionId(spraySessionId: number): Observable<FaultCase[]> {
    return this.#casesEndpoint.getAllBy({spraySessionId});
  }

  acknowledgeFaultCase(id: number): Observable<FaultCase> {
    return this.#casesEndpoint.acknowledge(id);
  }

  resolveFaultCase(id: number, resolutionNotes: string): Observable<FaultCase> {
    return this.#casesEndpoint.resolve(id, resolutionNotes);
  }

  getFaultRules(): Observable<FaultRule[]> {
    return this.#rulesEndpoint.getAll();
  }

  createFaultRule(rule: FaultRule): Observable<FaultRule> {
    return this.#rulesEndpoint.create(rule);
  }

  updateFaultRule(rule: FaultRule): Observable<FaultRule> {
    return this.#rulesEndpoint.update(rule, rule.id);
  }
}
