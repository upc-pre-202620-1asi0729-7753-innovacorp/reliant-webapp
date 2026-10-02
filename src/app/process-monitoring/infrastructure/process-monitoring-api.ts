import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {SpraySession} from '../domain/model/spray-session.entity';
import {SpraySessionsApiEndpoint} from './spray-sessions-api-endpoint';
import {SpraySessionResource} from './spray-sessions-response';
import {ProcessReading} from '../domain/model/process-reading.entity';
import {ProcessReadingsApiEndpoint} from './process-readings-api-endpoint';

@Injectable({providedIn: 'root'})
export class ProcessMonitoringApi extends BaseApi {
  readonly #sessionsEndpoint = new SpraySessionsApiEndpoint(this.http);

  readonly #readingsEndpoint = new ProcessReadingsApiEndpoint(this.http);

  getReadingsBySessionId(spraySessionId: number): Observable<ProcessReading[]> {
    return this.#readingsEndpoint.getAllBy({spraySessionId, _sort: 'epochMillis', _order: 'asc'});
  }

  createReading(reading: ProcessReading): Observable<ProcessReading> {
    return this.#readingsEndpoint.create(reading);
  }
  getSessions(): Observable<SpraySession[]> {
    return this.#sessionsEndpoint.getAll();
  }

  getSession(id: number): Observable<SpraySession> {
    return this.#sessionsEndpoint.getById(id);
  }

  createSession(session: SpraySession): Observable<SpraySession> {
    return this.#sessionsEndpoint.create(session);
  }

  patchSession(id: number, changes: Partial<SpraySessionResource>): Observable<SpraySession> {
    return this.#sessionsEndpoint.patch(id, changes);
  }
}
