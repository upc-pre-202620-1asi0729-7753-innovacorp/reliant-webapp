import {Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {SpraySession} from '../domain/model/spray-session.entity';
import {ProcessReading} from '../domain/model/process-reading.entity';
import {DeviationCounts, SpraySessionsApiEndpoint} from './spray-sessions-api-endpoint';

@Injectable({providedIn: 'root'})
export class ProcessMonitoringApi extends BaseApi {
  readonly #sessionsEndpoint = new SpraySessionsApiEndpoint(this.http);

  getSessions(): Observable<SpraySession[]> {
    return this.#sessionsEndpoint.getAll();
  }

  getSession(id: number): Observable<SpraySession> {
    return this.#sessionsEndpoint.getById(id);
  }

  startSession(session: SpraySession): Observable<SpraySession> {
    return this.#sessionsEndpoint.create(session);
  }

  completeSession(id: number): Observable<SpraySession> {
    return this.#sessionsEndpoint.complete(id);
  }

  abortSession(id: number, reason: string): Observable<SpraySession> {
    return this.#sessionsEndpoint.abort(id, reason);
  }

  getReadingsBySessionId(spraySessionId: number): Observable<ProcessReading[]> {
    return this.#sessionsEndpoint.getReadings(spraySessionId).pipe(
      map(readings => [...readings].sort((a, b) => a.epochMillis - b.epochMillis || a.id - b.id))
    );
  }

  ingestReadings(spraySessionId: number, readings: ProcessReading[]): Observable<ProcessReading[]> {
    return this.#sessionsEndpoint.ingestReadings(spraySessionId, readings);
  }

  getDeviations(spraySessionId: number): Observable<DeviationCounts> {
    return this.#sessionsEndpoint.getDeviations(spraySessionId);
  }
}
