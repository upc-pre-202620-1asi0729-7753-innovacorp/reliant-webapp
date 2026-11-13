import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {Recuperation} from '../domain/model/recuperation.entity';
import {RecuperationResource, RecuperationsResponse} from './recuperations-response';
import {RecuperationAssembler} from './recuperation-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

export class RecuperationsApiEndpoint extends BaseApiEndpoint<Recuperation, RecuperationResource, RecuperationsResponse, RecuperationAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderRecuperationsEndpointPath}`, new RecuperationAssembler());
  }

  /** PATCH /recuperations/{id}/completion closes the work order. */
  complete(recuperationId: number): Observable<Recuperation> {
    return this.http.patch<RecuperationResource>(`${this.endpointUrl}/${recuperationId}/completion`, {}).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to complete recuperation'))
    );
  }
}
