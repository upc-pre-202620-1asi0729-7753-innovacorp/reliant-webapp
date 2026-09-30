import {computed, inject, Injectable, Signal, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {retry} from 'rxjs';
import {Customer} from '../domain/model/customer.entity';
import {TraceabilityApi} from '../infrastructure/traceability-api';

@Injectable({
  providedIn: 'root'
})
export class TraceabilityStore {
  readonly #api = inject(TraceabilityApi);

  readonly #customersSignal = signal<Customer[]>([]);
  readonly customers = this.#customersSignal.asReadonly();
  readonly customerCount = computed(() => this.customers().length);

  readonly #loadingSignal = signal<boolean>(false);
  readonly loading = this.#loadingSignal.asReadonly();
  readonly #errorSignal = signal<string | null>(null);
  readonly error = this.#errorSignal.asReadonly();

  constructor() {
    this.#loadCustomers();
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

  #loadCustomers(): void {
    this.#loadingSignal.set(true);
    this.#errorSignal.set(null);
    this.#api.getCustomers().pipe(takeUntilDestroyed()).subscribe({
      next: customers => {
        this.#customersSignal.set(customers);
        this.#loadingSignal.set(false);
        this.#errorSignal.set(null);
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
}
