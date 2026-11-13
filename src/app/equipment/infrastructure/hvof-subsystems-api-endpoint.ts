import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {environment} from '../../../environments/environment';
import {ErrorHandlingEnabledBaseType} from '../../shared/infrastructure/error-handling-enabled-base-type';
import {HvofSubsystem} from '../domain/model/hvof-subsystem.entity';
import {HvofSubsystemResource} from './hvof-subsystems-response';
import {HvofSubsystemAssembler} from './hvof-subsystem-assembler';

/** Subsystems live under their HVOF system: /hvof-systems/{id}/subsystems. */
export class HvofSubsystemsApiEndpoint extends ErrorHandlingEnabledBaseType {
  readonly #assembler = new HvofSubsystemAssembler();
  readonly #systemsUrl = `${environment.platformProviderApiBaseUrl}${environment.platformProviderHvofSystemsEndpointPath}`;

  constructor(private readonly http: HttpClient) {
    super();
  }

  getAllBySystemId(hvofSystemId: number): Observable<HvofSubsystem[]> {
    return this.http.get<HvofSubsystemResource[]>(`${this.#systemsUrl}/${hvofSystemId}/subsystems`).pipe(
      map(resources => resources.map(r => this.#assembler.toEntityFromResource(r))),
      catchError(this.handleError('Failed to fetch subsystems'))
    );
  }

  create(subsystem: HvofSubsystem): Observable<HvofSubsystem> {
    const resource = this.#assembler.toResourceFromEntity(subsystem);
    return this.http.post<HvofSubsystemResource>(`${this.#systemsUrl}/${subsystem.hvofSystemId}/subsystems`, resource).pipe(
      map(created => this.#assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to register subsystem'))
    );
  }
}
