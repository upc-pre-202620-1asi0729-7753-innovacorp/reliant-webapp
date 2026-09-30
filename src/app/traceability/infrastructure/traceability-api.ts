import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {Customer} from '../domain/model/customer.entity';
import {CustomersApiEndpoint} from './customers-api-endpoint';

@Injectable({providedIn: 'root'})
export class TraceabilityApi extends BaseApi {
  readonly #customersEndpoint = new CustomersApiEndpoint(this.http);

  getCustomers(): Observable<Customer[]> {
    return this.#customersEndpoint.getAll();
  }

  getCustomer(id: number): Observable<Customer> {
    return this.#customersEndpoint.getById(id);
  }

  createCustomer(customer: Customer): Observable<Customer> {
    return this.#customersEndpoint.create(customer);
  }

  updateCustomer(customer: Customer): Observable<Customer> {
    return this.#customersEndpoint.update(customer, customer.id);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.#customersEndpoint.delete(id);
  }
}
