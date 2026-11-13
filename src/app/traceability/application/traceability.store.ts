import {computed, inject, Injectable, Signal, signal} from '@angular/core';
import {forkJoin, Observable, retry} from 'rxjs';
import {Customer} from '../domain/model/customer.entity';
import {RecoveredComponent} from '../domain/model/component.entity';
import {Recuperation} from '../domain/model/recuperation.entity';
import {TraceabilityApi} from '../infrastructure/traceability-api';
import {IamStore} from '../../iam/application/iam.store';

@Injectable({providedIn: 'root'})
export class TraceabilityStore {
  readonly #api = inject(TraceabilityApi);
  readonly #iam = inject(IamStore);

  readonly #customersSignal = signal<Customer[]>([]);
  readonly customers = this.#customersSignal.asReadonly();
  readonly customerCount = computed(() => this.customers().length);

  readonly #componentsSignal = signal<RecoveredComponent[]>([]);
  readonly components = this.#componentsSignal.asReadonly();
  readonly componentCount = computed(() => this.components().length);

  readonly #recuperationsSignal = signal<Recuperation[]>([]);
  readonly recuperations = this.#recuperationsSignal.asReadonly();
  readonly recuperationCount = computed(() => this.recuperations().length);
  readonly openRecuperations = computed(() =>
    this.recuperations().filter(r => r.status === 'RECEIVED' || r.status === 'IN_PROGRESS' || r.status === 'REWORK'));

  readonly #loadingSignal = signal<boolean>(false);
  readonly loading = this.#loadingSignal.asReadonly();
  readonly #errorSignal = signal<string | null>(null);
  readonly error = this.#errorSignal.asReadonly();
  readonly #loadedSignal = signal<boolean>(false);
  readonly loaded = this.#loadedSignal.asReadonly();

  constructor() {
    this.reload();
  }

  reload(): void {
    this.#loadedSignal.set(false);
    if (!this.#iam.organizationId() || !this.#iam.isSupplier()) {
      this.#customersSignal.set([]);
      this.#componentsSignal.set([]);
      this.#recuperationsSignal.set([]);
      return;
    }
    this.#loadingSignal.set(true);
    this.#errorSignal.set(null);
    forkJoin({customers: this.#api.getCustomers(), recuperations: this.#api.getRecuperations()}).subscribe({
      next: ({customers, recuperations}) => {
        this.#customersSignal.set(customers);
        this.#recuperationsSignal.set(recuperations);
        this.#loadComponents(customers);
      },
      error: err => {
        this.#errorSignal.set(this.#formatError(err, 'Failed to load traceability data'));
        this.#loadingSignal.set(false);
        this.#loadedSignal.set(true);
      }
    });
  }

  #loadComponents(customers: Customer[]): void {
    if (customers.length === 0) {
      this.#componentsSignal.set([]);
      this.#loadingSignal.set(false);
      this.#loadedSignal.set(true);
      return;
    }
    forkJoin(customers.map(c => this.#api.getComponentsByCustomerId(c.id))).subscribe({
      next: lists => {
        this.#componentsSignal.set(lists.flat());
        this.#loadingSignal.set(false);
        this.#loadedSignal.set(true);
      },
      error: err => {
        this.#errorSignal.set(this.#formatError(err, 'Failed to load components'));
        this.#loadingSignal.set(false);
        this.#loadedSignal.set(true);
      }
    });
  }

  getCustomerById(id: number): Signal<Customer | undefined> {
    return computed(() => id ? this.customers().find(c => c.id === id) : undefined);
  }

  customerNameOf(customerId: number): string {
    return this.customers().find(c => c.id === customerId)?.legalName ?? `#${customerId}`;
  }

  addCustomer(customer: Customer, onCreated?: (created: Customer) => void): void {
    this.#run(this.#api.createCustomer(customer), created => {
      this.#customersSignal.update(list => [...list, created]);
      onCreated?.(created);
    }, 'Failed to register customer');
  }

  updateCustomer(updated: Customer): void {
    this.#run(this.#api.updateCustomer(updated), customer =>
      this.#customersSignal.update(list => list.map(c => c.id === customer.id ? customer : c)), 'Failed to update customer');
  }

  getComponentById(id: number): Signal<RecoveredComponent | undefined> {
    return computed(() => id ? this.components().find(c => c.id === id) : undefined);
  }

  componentSerialOf(componentId: number): string {
    return this.components().find(c => c.id === componentId)?.serialNumber ?? `#${componentId}`;
  }

  componentsOf(customerId: number): Signal<RecoveredComponent[]> {
    return computed(() => this.components().filter(c => c.customerId === customerId));
  }

  addComponent(component: RecoveredComponent, onCreated?: (created: RecoveredComponent) => void): void {
    this.#run(this.#api.createComponent(component), created => {
      this.#componentsSignal.update(list => [...list, created]);
      onCreated?.(created);
    }, 'Failed to register component');
  }

  getRecuperationById(id: number): Signal<Recuperation | undefined> {
    return computed(() => id ? this.recuperations().find(r => r.id === id) : undefined);
  }

  addRecuperation(recuperation: Recuperation, onCreated?: (created: Recuperation) => void): void {
    this.#run(this.#api.createRecuperation(recuperation), created => {
      this.#recuperationsSignal.update(list => [...list, created]);
      onCreated?.(created);
    }, 'Failed to open recuperation');
  }

  completeRecuperation(id: number): void {
    this.#run(this.#api.completeRecuperation(id), completed =>
      this.#recuperationsSignal.update(list => list.map(r => r.id === completed.id ? completed : r)), 'Failed to complete recuperation');
  }

  /** Re-reads the recuperations so linked sessions and statuses changed by the platform show up. */
  refreshRecuperations(): void {
    this.#api.getRecuperations().subscribe({next: list => this.#recuperationsSignal.set(list)});
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
