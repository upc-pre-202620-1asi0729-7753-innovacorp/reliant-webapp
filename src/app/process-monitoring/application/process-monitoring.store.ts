import {computed, inject, Injectable, Signal, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {Observable, retry} from 'rxjs';
import {SpraySession} from '../domain/model/spray-session.entity';
import {ProcessMonitoringApi} from '../infrastructure/process-monitoring-api';

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
}
