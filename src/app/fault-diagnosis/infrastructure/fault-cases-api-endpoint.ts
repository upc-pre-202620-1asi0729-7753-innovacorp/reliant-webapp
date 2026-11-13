import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {environment} from '../../../environments/environment';
import {FaultCase} from '../domain/model/fault-case.entity';
import {FaultCaseResource, FaultCasesResponse} from './fault-cases-response';
import {FaultCaseAssembler} from './fault-case-assembler';

export class FaultCasesApiEndpoint extends BaseApiEndpoint<FaultCase, FaultCaseResource, FaultCasesResponse, FaultCaseAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderFaultCasesEndpointPath}`, new FaultCaseAssembler());
  }

  acknowledge(faultCaseId: number): Observable<FaultCase> {
    return this.http.patch<FaultCaseResource>(`${this.endpointUrl}/${faultCaseId}/acknowledgement`, {}).pipe(
      map(r => this.assembler.toEntityFromResource(r)),
      catchError(this.handleError('Failed to acknowledge fault case'))
    );
  }

  resolve(faultCaseId: number, resolutionNotes: string): Observable<FaultCase> {
    return this.http.patch<FaultCaseResource>(`${this.endpointUrl}/${faultCaseId}/resolution`, {resolutionNotes}).pipe(
      map(r => this.assembler.toEntityFromResource(r)),
      catchError(this.handleError('Failed to resolve fault case'))
    );
  }
}
