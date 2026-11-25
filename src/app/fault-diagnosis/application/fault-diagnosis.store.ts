import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { Observable, retry } from 'rxjs';
import { FaultDiagnosisApi } from '../infrastructure/fault-diagnosis-api';
import { FaultCase } from '../domain/model/fault-case.entity';
import { FaultRule } from '../domain/model/fault-rule.entity';
import { IamStore } from '../../iam/application/iam.store';

@Injectable({ providedIn: 'root' })
export class FaultDiagnosisStore {
  readonly #api = inject(FaultDiagnosisApi);
  readonly #iam = inject(IamStore);

  readonly #casesSignal = signal<FaultCase[]>([]);
  readonly faultCases = this.#casesSignal.asReadonly();
  readonly openCases = computed(() => this.faultCases().filter((c) => c.isOpen));
  readonly openCount = computed(() => this.openCases().length);
  readonly shutdownOpenCount = computed(
    () => this.openCases().filter((c) => c.band === 'shutdown').length,
  );

  /** Open and acknowledged cases grouped by parameter, for the dashboard. */
  readonly casesByParameter = computed(() => {
    const counts = new Map<string, number>();
    for (const c of this.faultCases()) counts.set(c.parameter, (counts.get(c.parameter) ?? 0) + 1);
    return counts;
  });

  readonly #rulesSignal = signal<FaultRule[]>([]);
  readonly faultRules = this.#rulesSignal.asReadonly();

  readonly #loadingSignal = signal(false);
  readonly loading = this.#loadingSignal.asReadonly();
  readonly #errorSignal = signal<string | null>(null);
  readonly error = this.#errorSignal.asReadonly();

  constructor() {
    this.reload();
  }

  reload(): void {
    if (!this.#iam.organizationId() || !this.#iam.isSupplier()) {
      this.#casesSignal.set([]);
      this.#rulesSignal.set([]);
      return;
    }
    this.loadFaultCases();
    this.loadFaultRules();
  }

  loadFaultCases(): void {
    this.#loadingSignal.set(true);
    this.#api.getFaultCases().subscribe({
      next: (cases) => {
        this.#casesSignal.set(cases);
        this.#loadingSignal.set(false);
      },
      error: (err) => {
        this.#errorSignal.set(this.#formatError(err, 'Failed to load fault cases'));
        this.#loadingSignal.set(false);
      },
    });
  }

  loadFaultRules(): void {
    this.#api.getFaultRules().subscribe({
      next: (rules) => this.#rulesSignal.set(rules),
      error: (err) => this.#errorSignal.set(this.#formatError(err, 'Failed to load fault rules')),
    });
  }

  getFaultCaseById(id: number): Signal<FaultCase | undefined> {
    return computed(() => (id ? this.faultCases().find((c) => c.id === id) : undefined));
  }

  casesOf(spraySessionId: number): Signal<FaultCase[]> {
    return computed(() => this.faultCases().filter((c) => c.spraySessionId === spraySessionId));
  }

  getFaultRuleById(id: number): Signal<FaultRule | undefined> {
    return computed(() => (id ? this.faultRules().find((r) => r.id === id) : undefined));
  }

  acknowledge(id: number): void {
    this.#run(
      this.#api.acknowledgeFaultCase(id),
      (updated) => this.#replaceCase(updated),
      'Failed to acknowledge fault case',
    );
  }

  resolve(id: number, resolutionNotes: string, onDone?: () => void): void {
    this.#run(
      this.#api.resolveFaultCase(id, resolutionNotes),
      (updated) => {
        this.#replaceCase(updated);
        onDone?.();
      },
      'Failed to resolve fault case',
    );
  }

  addFaultRule(rule: FaultRule): void {
    this.#run(
      this.#api.createFaultRule(rule),
      (created) => this.#rulesSignal.update((list) => [...list, created]),
      'Failed to create fault rule',
    );
  }

  updateFaultRule(rule: FaultRule): void {
    this.#run(
      this.#api.updateFaultRule(rule),
      (updated) =>
        this.#rulesSignal.update((list) => list.map((r) => (r.id === updated.id ? updated : r))),
      'Failed to update fault rule',
    );
  }

  /** Adds back the FESA default rules the organization is missing (they are seeded at sign-up; this covers older organizations and deletions). */
  restoreDefaultFaultRules(): void {
    this.#run(
      this.#api.restoreDefaultFaultRules(),
      (rules) => this.#rulesSignal.set(rules),
      'Failed to restore default fault rules',
    );
  }

  #replaceCase(updated: FaultCase): void {
    this.#casesSignal.update((list) => list.map((c) => (c.id === updated.id ? updated : c)));
  }

  #run<T>(request: Observable<T>, onNext: (value: T) => void, fallback: string): void {
    this.#loadingSignal.set(true);
    this.#errorSignal.set(null);
    request.pipe(retry({ count: 1, delay: 300 })).subscribe({
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

  #formatError(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
  }
}
