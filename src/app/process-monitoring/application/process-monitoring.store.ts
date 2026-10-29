import {computed, inject, Injectable, Signal, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {SpraySession, SpraySessionStatus} from '../domain/model/spray-session.entity';
import {ProcessMonitoringApi} from '../infrastructure/process-monitoring-api';
import {ProcessReading} from '../domain/model/process-reading.entity';
import {Band} from '../domain/model/process-reading.entity';
import { EMPTY, Observable, Subscription, catchError, exhaustMap, retry, timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProcessMonitoringStore {
  readonly #api = inject(ProcessMonitoringApi);

  readonly #sessionsSignal = signal<SpraySession[]>([]);
  readonly sessions = this.#sessionsSignal.asReadonly();
  readonly activeSessions = computed(() => this.sessions().filter((s) => s.isActive));

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
    const latest = new Map<string, ProcessReading>();

    for (const reading of this.readings()) {
      const previous = latest.get(reading.parameter);

      if (
        !previous ||
        reading.epochMillis > previous.epochMillis ||
        (reading.epochMillis === previous.epochMillis && reading.id > previous.id)
      ) {
        latest.set(reading.parameter, reading);
      }
    }

    return latest;
  });

  readonly parameters = computed(() => [...this.latestByParameter().keys()]);

  readonly bandCounts = computed(() => {
    const counts: Record<Band, number> = { nominal: 0, out_of_nominal: 0, warning: 0, shutdown: 0 };
    for (const r of this.readings()) {
      counts[r.band]++;
    }
    return counts;
  });

  constructor() {
    this.#loadSessions();
  }

  readonly #deviationsSignal = signal<Map<number, number>>(new Map());
  readonly deviations = this.#deviationsSignal.asReadonly();

  loadDeviations(sessionId: number): void {
    if (this.deviations().has(sessionId)) return;
    this.#api.getDeviationCount(sessionId).subscribe({
      next: (count) => this.#deviationsSignal.update((m) => new Map(m).set(sessionId, count)),
      error: () => this.#deviationsSignal.update((m) => new Map(m).set(sessionId, -1)),
    });
  }

  getSessionById(id: number): Signal<SpraySession | undefined> {
    return computed(() => (id ? this.sessions().find((s) => s.id === id) : undefined));
  }

  startSession(session: SpraySession, onStarted?: (created: SpraySession) => void): void {
    this.#run(
      this.#api.createSession(session),
      (created) => {
        this.#sessionsSignal.update((list) => [...list, created]);
        onStarted?.(created);
      },
      'Failed to start session',
    );
  }

  #run<T>(request: Observable<T>, onNext: (value: T) => void, fallback: string): void {
    this.#loadingSignal.set(true);
    this.#errorSignal.set(null);
    request.pipe(retry(2)).subscribe({
      next: (value) => {
        onNext(value);
        this.#loadingSignal.set(false);
      },
      error: (err) => {
        this.#errorSignal.set(this.#formatError(err, fallback));
        this.#loadingSignal.set(false);
      },
    });
  }

  #loadSessions(): void {
    this.#loadingSignal.set(true);
    this.#api
      .getSessions()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (sessions) => {
          this.#sessionsSignal.set(sessions);
          this.#loadingSignal.set(false);
        },
        error: (err) => {
          this.#errorSignal.set(this.#formatError(err, 'Failed to load sessions'));
          this.#loadingSignal.set(false);
        },
      });
  }

  #formatError(error: unknown, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found')
        ? `${fallback}: Not found`
        : error.message;
    }
    return fallback;
  }

  loadReadings(sessionId: number): void {
    this.#api.getReadingsBySessionId(sessionId).subscribe({
      next: (readings) => {
        this.#readingsSignal.set(readings);
        this.#lastUpdateSignal.set(new Date());
      },
      error: (err) => this.#errorSignal.set(this.#formatError(err, 'Failed to load readings')),
    });
  }

  startPolling(sessionId: number, everyMs = 5000): void {
    this.stopPolling();

    this.#polling = timer(0, everyMs)
      .pipe(
        exhaustMap(() =>
          this.#api.getReadingsBySessionId(sessionId).pipe(
            catchError((error: unknown) => {
              this.#errorSignal.set(this.#formatError(error, 'Failed to refresh readings'));

              return EMPTY;
            }),
          ),
        ),
      )
      .subscribe({
        next: (readings) => {
          this.#readingsSignal.set(readings);
          this.#lastUpdateSignal.set(new Date());
          this.#errorSignal.set(null);
        },
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
      next: (created) => this.#readingsSignal.update((list) => [...list, created]),
      error: (err) => this.#errorSignal.set(this.#formatError(err, 'Failed to send reading')),
    });
  }

  completeSession(id: number): void {
    this.#finish(id, { status: 'completed', endedAt: new Date().toISOString() });
  }

  abortSession(id: number, reason: string): void {
    this.#finish(id, { status: 'aborted', endedAt: new Date().toISOString(), abortReason: reason });
  }

  #finish(
    id: number,
    changes: { status: SpraySessionStatus; endedAt: string; abortReason?: string },
  ): void {
    this.#run(
      this.#api.patchSession(id, changes),
      (updated) => {
        this.#sessionsSignal.update((list) => list.map((s) => (s.id === updated.id ? updated : s)));
        this.stopPolling();
      },
      'Failed to finish session',
    );
  }
}
