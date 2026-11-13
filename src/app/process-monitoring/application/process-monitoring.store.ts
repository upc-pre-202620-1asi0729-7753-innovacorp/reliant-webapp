import {computed, inject, Injectable, Signal, signal} from '@angular/core';
import {catchError, EMPTY, exhaustMap, Observable, retry, Subscription, timer} from 'rxjs';
import {SpraySession, SpraySessionStatus} from '../domain/model/spray-session.entity';
import {ProcessMonitoringApi} from '../infrastructure/process-monitoring-api';
import {Band, ProcessReading} from '../domain/model/process-reading.entity';
import {IamStore} from '../../iam/application/iam.store';

@Injectable({providedIn: 'root'})
export class ProcessMonitoringStore {
  readonly #api = inject(ProcessMonitoringApi);
  readonly #iam = inject(IamStore);

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

  readonly #deviationsSignal = signal<Map<number, number>>(new Map());
  readonly deviations = this.#deviationsSignal.asReadonly();

  readonly latestByParameter = computed(() => {
    const latest = new Map<string, ProcessReading>();
    for (const reading of this.readings()) {
      const previous = latest.get(reading.parameter);
      if (!previous || reading.epochMillis > previous.epochMillis || (reading.epochMillis === previous.epochMillis && reading.id > previous.id)) {
        latest.set(reading.parameter, reading);
      }
    }
    return latest;
  });

  readonly parameters = computed(() => [...this.latestByParameter().keys()]);

  readonly bandCounts = computed(() => {
    const counts: Record<Band, number> = {nominal: 0, out_of_nominal: 0, warning: 0, shutdown: 0};
    for (const r of this.readings()) counts[r.band]++;
    return counts;
  });

  readonly sessionsByStatus = computed(() => {
    const counts: Record<SpraySessionStatus, number> = {active: 0, completed: 0, aborted: 0, interrupted: 0};
    for (const session of this.sessions()) counts[session.status]++;
    return counts;
  });

  constructor() {
    this.reload();
  }

  reload(): void {
    if (!this.#iam.organizationId() || !this.#iam.isSupplier()) {
      this.#sessionsSignal.set([]);
      return;
    }
    this.#loadingSignal.set(true);
    this.#api.getSessions().subscribe({
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

  getSessionById(id: number): Signal<SpraySession | undefined> {
    return computed(() => (id ? this.sessions().find(s => s.id === id) : undefined));
  }

  sessionsOf(recuperationId: number): Signal<SpraySession[]> {
    return computed(() => this.sessions().filter(s => s.recuperationId === recuperationId));
  }

  loadDeviations(sessionId: number): void {
    if (this.deviations().has(sessionId)) return;
    this.#api.getDeviations(sessionId).subscribe({
      next: counts => this.#deviationsSignal.update(m => new Map(m).set(sessionId, counts.warning + counts.shutdown)),
      error: () => this.#deviationsSignal.update(m => new Map(m).set(sessionId, -1))
    });
  }

  startSession(session: SpraySession, onStarted?: (created: SpraySession) => void): void {
    this.#run(this.#api.startSession(session), created => {
      this.#sessionsSignal.update(list => [...list, created]);
      onStarted?.(created);
    }, 'Failed to start session');
  }

  completeSession(id: number): void {
    this.#run(this.#api.completeSession(id), updated => {
      this.#sessionsSignal.update(list => list.map(s => (s.id === updated.id ? updated : s)));
      this.stopPolling();
    }, 'Failed to complete session');
  }

  abortSession(id: number, reason: string): void {
    this.#run(this.#api.abortSession(id, reason), updated => {
      this.#sessionsSignal.update(list => list.map(s => (s.id === updated.id ? updated : s)));
      this.stopPolling();
    }, 'Failed to abort session');
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
    this.#polling = timer(0, everyMs).pipe(
      exhaustMap(() => this.#api.getReadingsBySessionId(sessionId).pipe(
        catchError((error: unknown) => {
          this.#errorSignal.set(this.#formatError(error, 'Failed to refresh readings'));
          return EMPTY;
        })
      ))
    ).subscribe({
      next: readings => {
        this.#readingsSignal.set(readings);
        this.#lastUpdateSignal.set(new Date());
        this.#errorSignal.set(null);
      }
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

  /** Sends one or many readings; the platform returns them classified by band. */
  addReadings(sessionId: number, readings: ProcessReading[], onDone?: (created: ProcessReading[]) => void): void {
    if (readings.length === 0) return;
    this.#api.ingestReadings(sessionId, readings).subscribe({
      next: created => {
        this.#readingsSignal.update(list => [...list, ...created]);
        this.#deviationsSignal.update(m => {
          const next = new Map(m);
          next.delete(sessionId);
          return next;
        });
        onDone?.(created);
      },
      error: err => this.#errorSignal.set(this.#formatError(err, 'Failed to send readings'))
    });
  }

  addReading(reading: ProcessReading): void {
    this.addReadings(reading.spraySessionId, [reading]);
  }

  #run<T>(request: Observable<T>, onNext: (value: T) => void, fallback: string): void {
    this.#loadingSignal.set(true);
    this.#errorSignal.set(null);
    request.pipe(retry({count: 1, delay: 300})).subscribe({
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

  #formatError(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
  }
}
