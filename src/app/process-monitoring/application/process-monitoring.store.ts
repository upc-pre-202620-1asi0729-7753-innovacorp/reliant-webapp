import {computed, inject, Injectable, Signal, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Observable, retry} from 'rxjs';
import {SpraySession, SpraySessionStatus} from '../domain/model/spray-session.entity';
import {ProcessMonitoringApi} from '../infrastructure/process-monitoring-api';
import {interval, Subscription, switchMap} from 'rxjs';
import {ProcessReading} from '../domain/model/process-reading.entity';
import {Band} from '../domain/model/process-reading.entity';

@Injectable({
  providedIn: 'root'
})
export class ProcessMonitoringStore {
  readonly #api = inject(ProcessMonitoringApi);

  readonly #sessionsSignal = signal<SpraySession[]>([]);
  readonly sessions = this.#sessionsSignal.asReadonly();
  readonly activeSessions = computed(() => this.sessions().filter(s => s.isActive));

  readonly #loadingSignal = signal<boolean>(false);
  readonly loading = this.#loadingSignal.asReadonly();
  readonly #errorSignal = signal<string | null>(null);
  readonly error = this.#errorSignal.asReadonly();

  readonly #readingsSignal = signal<ProcessReading[]>([]);
  readonly readings = this.#readingsSignal.asReadonly();
  readonly #lastUpdateSignal = signal<Date | null>(null);
  readonly lastUpdate = this.#lastUpdateSignal.asReadonly();
  #polling: Subscription | null = null;

  readonly latestByParameter = computed(() => {
    const map = new Map<string, ProcessReading>();
    for (const r of this.readings()) {
      map.set(r.parameter, r);
    }
    return map;
  });

  readonly parameters = computed(() => [...this.latestByParameter().keys()]);

  readonly bandCounts = computed(() => {
    const counts: Record<Band, number> = {nominal: 0, out_of_nominal: 0, warning: 0, shutdown: 0};
    for (const r of this.readings()) {
      counts[r.band]++;
    }
    return counts;
  });

  constructor() {
    this.#loadSessions();
  }

  getSessionById(id: number): Signal<SpraySession | undefined> {
    return computed(() => id ? this.sessions().find(s => s.id === id) : undefined);
  }

  startSession(session: SpraySession, onStarted?: (created: SpraySession) => void): void {
    this.#run(this.#api.createSession(session), created => {
      this.#sessionsSignal.update(list => [...list, created]);
      onStarted?.(created);
    }, 'Failed to start session');
  }

  #run<T>(request: Observable<T>, onNext: (value: T) => void, fallback: string): void {
    this.#loadingSignal.set(true);
    this.#errorSignal.set(null);
    request.pipe(retry(2)).subscribe({
      next: value => {
        onNext(value);
        this.#loadingSignal.set(false);
      },
      error: err => {
        this.#errorSignal.set(this.#formatError(err, fallback));
        this.#loadingSignal.set(false);
      }
    });
  }

  #loadSessions(): void {
    this.#loadingSignal.set(true);
    this.#api.getSessions().pipe(takeUntilDestroyed()).subscribe({
      next: sessions => {
        this.#sessionsSignal.set(sessions);
        this.#loadingSignal.set(false);
      },
      error: err => {
        this.#errorSignal.set(this.#formatError(err, 'Failed to load sessions'));
        this.#loadingSignal.set(false);
      }
    });
  }

  #formatError(error: unknown, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found') ? `${fallback}: Not found` : error.message;
    }
    return fallback;
  }

  loadReadings(sessionId: number): void {
    this.#api.getReadingsBySessionId(sessionId).subscribe({
      next: readings => {
        this.#readingsSignal.set(readings);
        this.#lastUpdateSignal.set(new Date());
      },
      error: err => this.#errorSignal.set(this.#formatError(err, 'Failed to load readings'))
    });
  }

  startPolling(sessionId: number, everyMs = 5000): void {
    this.stopPolling();
    this.loadReadings(sessionId);
    this.#polling = interval(everyMs).pipe(
      switchMap(() => this.#api.getReadingsBySessionId(sessionId))
    ).subscribe({
      next: readings => {
        this.#readingsSignal.set(readings);
        this.#lastUpdateSignal.set(new Date());
      },
      error: err => this.#errorSignal.set(this.#formatError(err, 'Failed to refresh readings'))
    });
  }

  stopPolling(): void {
    this.#polling?.unsubscribe();
    this.#polling = null;
  }

  clearReadings(): void {
    this.stopPolling();
    this.#readingsSignal.set([]);
    this.#lastUpdateSignal.set(null);
  }

  addReading(reading: ProcessReading): void {
    this.#api.createReading(reading).subscribe({
      next: created => this.#readingsSignal.update(list => [...list, created]),
      error: err => this.#errorSignal.set(this.#formatError(err, 'Failed to send reading'))
    });
  }

  completeSession(id: number): void {
    this.#finish(id, {status: 'completed', endedAt: new Date().toISOString()});
  }

  abortSession(id: number, reason: string): void {
    this.#finish(id, {status: 'aborted', endedAt: new Date().toISOString(), abortReason: reason});
  }

  #finish(id: number, changes: {status: SpraySessionStatus; endedAt: string; abortReason?: string}): void {
    this.#run(this.#api.patchSession(id, changes), updated => {
      this.#sessionsSignal.update(list => list.map(s => s.id === updated.id ? updated : s));
      this.stopPolling();
    }, 'Failed to finish session');
  }
}
