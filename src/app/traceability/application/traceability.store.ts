import {computed, inject, Injectable, Signal, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {retry} from 'rxjs';
import {Customer} from '../domain/model/customer.entity';
import {TraceabilityApi} from '../infrastructure/traceability-api';
import {RecoveredComponent} from '../domain/model/component.entity';
import {Recuperation} from '../domain/model/recuperation.entity';
import {IamStore} from '../../iam/application/iam.store';

@Injectable({
  providedIn: 'root'
})
export class TraceabilityStore {
  readonly #api = inject(TraceabilityApi);

  readonly #customersSignal = signal<Customer[]>([]);
  readonly customers = this.#customersSignal.asReadonly();
  readonly customerCount = computed(() => this.customers().length);

  readonly #componentsSignal = signal<RecoveredComponent[]>([]);
  readonly components = this.#componentsSignal.asReadonly();
  readonly componentCount = computed(() => this.components().length);

  readonly #loadingSignal = signal<boolean>(false);
  readonly loading = this.#loadingSignal.asReadonly();
  readonly #errorSignal = signal<string | null>(null);
  readonly error = this.#errorSignal.asReadonly();

  readonly #recuperationsSignal = signal<Recuperation[]>([]);
  readonly recuperations = this.#recuperationsSignal.asReadonly();
  readonly recuperationCount = computed(() => this.recuperations().length);

  readonly #iam = inject(IamStore);

  constructor() {
    this.#loadCustomers();
    this.#loadComponents();
    this.#loadRecuperations();
  }

  getCustomerById(id: number): Signal<Customer | undefined> {
    return computed(() => id ? this.customers().find(c => c.id === id) : undefined);
  }

  addCustomer(customer: Customer): void {
    this.#loadingSignal.set(true);
    this.#errorSignal.set(null);
    this.#api.createCustomer(customer).pipe(retry(2)).subscribe({
      next: created => {
        this.#customersSignal.update(customers => [...customers, created]);
        this.#loadingSignal.set(false);
      },
      error: err => {
        this.#errorSignal.set(this.#formatError(err, 'Failed to create customer'));
        this.#loadingSignal.set(false);
      }
    });
  }

  updateCustomer(updated: Customer): void {
    this.#loadingSignal.set(true);
    this.#errorSignal.set(null);
    this.#api.updateCustomer(updated).pipe(retry(2)).subscribe({
      next: customer => {
        this.#customersSignal.update(customers => customers.map(c => c.id === customer.id ? customer : c));
        this.#loadingSignal.set(false);
      },
      error: err => {
        this.#errorSignal.set(this.#formatError(err, 'Failed to update customer'));
        this.#loadingSignal.set(false);
      }
    });
  }

  deleteCustomer(id: number): void {
    this.#loadingSignal.set(true);
    this.#errorSignal.set(null);
    this.#api.deleteCustomer(id).pipe(retry(2)).subscribe({
      next: () => {
        this.#customersSignal.update(customers => customers.filter(c => c.id !== id));
        this.#loadingSignal.set(false);
      },
      error: err => {
        this.#errorSignal.set(this.#formatError(err, 'Failed to delete customer'));
        this.#loadingSignal.set(false);
      }
    });
  }

  getComponentById(id: number): Signal<RecoveredComponent | undefined> {
    return computed(() => id ? this.components().find(c => c.id === id) : undefined);
  }

  customerNameOf(customerId: number): string {
    return this.customers().find(c => c.id === customerId)?.legalName ?? `#${customerId}`;
  }

  addComponent(component: RecoveredComponent): void {
    this.#loadingSignal.set(true);
    this.#errorSignal.set(null);
    this.#api.createComponent(component).pipe(retry(2)).subscribe({
      next: created => {
        this.#componentsSignal.update(components => [...components, created]);
        this.#loadingSignal.set(false);
      },
      error: err => {
        this.#errorSignal.set(this.#formatError(err, 'Failed to create component'));
        this.#loadingSignal.set(false);
      }
    });
  }

  updateComponent(updated: RecoveredComponent): void {
    this.#loadingSignal.set(true);
    this.#errorSignal.set(null);
    this.#api.updateComponent(updated).pipe(retry(2)).subscribe({
      next: component => {
        this.#componentsSignal.update(components => components.map(c => c.id === component.id ? component : c));
        this.#loadingSignal.set(false);
      },
      error: err => {
        this.#errorSignal.set(this.#formatError(err, 'Failed to update component'));
        this.#loadingSignal.set(false);
      }
    });
  }

  #loadComponents(): void {
    this.#loadingSignal.set(true);
    this.#errorSignal.set(null);
    this.#api.getComponents().pipe(takeUntilDestroyed()).subscribe({
      next: components => {
        this.#componentsSignal.set(components);
        this.#loadingSignal.set(false);
      },
      error: err => {
        this.#errorSignal.set(this.#formatError(err, 'Failed to load components'));
        this.#loadingSignal.set(false);
      }
    });
  }

  #loadCustomers(): void {
    const organizationId = this.#iam.organizationId();
    if (!organizationId) return;
    this.#loadingSignal.set(true);
    this.#errorSignal.set(null);
    this.#api.getCustomersByOrganizationId(organizationId).pipe(takeUntilDestroyed()).subscribe({
      next: customers => {
        this.#customersSignal.set(customers);
        this.#loadingSignal.set(false);
      },
      error: err => {
        this.#errorSignal.set(this.#formatError(err, 'Failed to load customers'));
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

  getRecuperationById(id: number): Signal<Recuperation | undefined> {
    return computed(() => id ? this.recuperations().find(r => r.id === id) : undefined);
  }

  componentSerialOf(componentId: number): string {
    return this.components().find(c => c.id === componentId)?.serialNumber ?? `#${componentId}`;
  }

  addRecuperation(recuperation: Recuperation): void {
    this.#loadingSignal.set(true);
    this.#errorSignal.set(null);
    this.#api.createRecuperation(recuperation).pipe(retry(2)).subscribe({
      next: created => {
        this.#recuperationsSignal.update(recuperations => [...recuperations, created]);
        this.#loadingSignal.set(false);
      },
      error: err => {
        this.#errorSignal.set(this.#formatError(err, 'Failed to create recuperation'));
        this.#loadingSignal.set(false);
      }
    });
  }

  updateRecuperation(updated: Recuperation): void {
    this.#loadingSignal.set(true);
    this.#errorSignal.set(null);
    this.#api.updateRecuperation(updated).pipe(retry(2)).subscribe({
      next: recuperation => {
        this.#recuperationsSignal.update(recuperations => recuperations.map(r => r.id === recuperation.id ? recuperation : r));
        this.#loadingSignal.set(false);
      },
      error: err => {
        this.#errorSignal.set(this.#formatError(err, 'Failed to update recuperation'));
        this.#loadingSignal.set(false);
      }
    });
  }

  #loadRecuperations(): void {
    const organizationId = this.#iam.organizationId();
    if (!organizationId) return;
    this.#loadingSignal.set(true);
    this.#errorSignal.set(null);
    this.#api.getRecuperationsByOrganizationId(organizationId).pipe(takeUntilDestroyed()).subscribe({
      next: recuperations => {
        this.#recuperationsSignal.set(recuperations);
        this.#loadingSignal.set(false);
      },
      error: err => {
        this.#errorSignal.set(this.#formatError(err, 'Failed to load recuperations'));
        this.#loadingSignal.set(false);
      }
    });
  }
}
