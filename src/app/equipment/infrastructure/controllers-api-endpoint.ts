import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {ErrorHandlingEnabledBaseType} from '../../shared/infrastructure/error-handling-enabled-base-type';
import {Controller} from '../domain/model/controller.entity';
import {ControllerResource} from './controllers-response';
import {ControllerAssembler} from './controller-assembler';

/** Controllers live under their HVOF system: /hvof-systems/{id}/controllers. */
export class ControllersApiEndpoint extends ErrorHandlingEnabledBaseType {
  readonly #assembler = new ControllerAssembler();
  readonly #systemsUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderHvofSystemsEndpointPath}`;

  constructor(private readonly http: HttpClient) {
    super();
  }

  getAllBySystemId(hvofSystemId: number): Observable<Controller[]> {
    return this.http.get<ControllerResource[]>(`${this.#systemsUrl}/${hvofSystemId}/controllers`).pipe(
      map(resources => resources.map(r => this.#assembler.toEntityFromResource(r))),
      catchError(this.handleError('Failed to fetch controllers'))
    );
  }

  create(controller: Controller): Observable<Controller> {
    const resource = this.#assembler.toResourceFromEntity(controller);
    return this.http.post<ControllerResource>(`${this.#systemsUrl}/${controller.hvofSystemId}/controllers`, resource).pipe(
      map(created => this.#assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to register controller'))
    );
  }
}
