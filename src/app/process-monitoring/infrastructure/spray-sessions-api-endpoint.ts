import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {SpraySession} from '../domain/model/spray-session.entity';
import {SpraySessionResource, SpraySessionsResponse} from './spray-sessions-response';
import {SpraySessionAssembler} from './spray-session-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {ProcessReading} from '../domain/model/process-reading.entity';
import {ProcessReadingResource} from './process-readings-response';
import {ProcessReadingAssembler} from './process-reading-assembler';

export interface DeviationCounts {
  warning: number;
  shutdown: number;
}

/**
 * /spray-sessions and its sub-resources: readings, deviations and passes.
 */
export class SpraySessionsApiEndpoint extends BaseApiEndpoint<SpraySession, SpraySessionResource, SpraySessionsResponse, SpraySessionAssembler> {
  readonly #readingAssembler = new ProcessReadingAssembler();

  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderSpraySessionsEndpointPath}`, new SpraySessionAssembler());
  }

  complete(spraySessionId: number): Observable<SpraySession> {
    return this.http.patch<SpraySessionResource>(`${this.endpointUrl}/${spraySessionId}/completion`, {}).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to complete session'))
    );
  }

  abort(spraySessionId: number, reason: string): Observable<SpraySession> {
    return this.http.patch<SpraySessionResource>(`${this.endpointUrl}/${spraySessionId}/abortion`, {reason}).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to abort session'))
    );
  }

  getReadings(spraySessionId: number, band?: string): Observable<ProcessReading[]> {
    const options = band ? {params: {band}} : {};
    return this.http.get<ProcessReadingResource[]>(`${this.endpointUrl}/${spraySessionId}/readings`, options).pipe(
      map(resources => resources.map(r => this.#readingAssembler.toEntityFromResource(r))),
      catchError(this.handleError('Failed to fetch readings'))
    );
  }

  /** The platform classifies each reading against the recipe bands frozen at session start. */
  ingestReadings(spraySessionId: number, readings: ProcessReading[]): Observable<ProcessReading[]> {
    const body = readings.map(r => ({
      epochMillis: r.epochMillis,
      plcClockOffsetMillis: r.plcClockOffsetMillis,
      tagPath: r.tagPath,
      parameter: r.parameter,
      subsystemId: r.subsystemId,
      partId: r.partId,
      value: r.value
    }));
    return this.http.post<ProcessReadingResource[]>(`${this.endpointUrl}/${spraySessionId}/readings`, body).pipe(
      map(resources => resources.map(r => this.#readingAssembler.toEntityFromResource(r))),
      catchError(this.handleError('Failed to send readings'))
    );
  }

  getDeviations(spraySessionId: number): Observable<DeviationCounts> {
    return this.http.get<DeviationCounts>(`${this.endpointUrl}/${spraySessionId}/deviations`).pipe(
      catchError(this.handleError('Failed to fetch deviations'))
    );
  }
}
