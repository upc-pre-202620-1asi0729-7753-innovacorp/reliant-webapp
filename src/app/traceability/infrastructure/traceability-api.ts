import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {Customer} from '../domain/model/customer.entity';
import {CustomersApiEndpoint} from './customers-api-endpoint';
import {ComponentsApiEndpoint} from './components-api-endpoint';
import {RecoveredComponent} from '../domain/model/component.entity';
import {Recuperation} from '../domain/model/recuperation.entity';
import {RecuperationsApiEndpoint} from './recuperations-api-endpoint';

/** The platform scopes customers and recuperations by the organization of the token; components hang from a customer. */
@Injectable({providedIn: 'root'})
export class TraceabilityApi extends BaseApi {
  readonly #customersEndpoint = new CustomersApiEndpoint(this.http);
  readonly #componentsEndpoint = new ComponentsApiEndpoint(this.http);
  readonly #recuperationsEndpoint = new RecuperationsApiEndpoint(this.http);

  getCustomers(): Observable<Customer[]> {
    return this.#customersEndpoint.getAll();
  }

  createCustomer(customer: Customer): Observable<Customer> {
    return this.#customersEndpoint.create(customer);
  }

  updateCustomer(customer: Customer): Observable<Customer> {
    return this.#customersEndpoint.update(customer, customer.id);
  }

  getComponentsByCustomerId(customerId: number): Observable<RecoveredComponent[]> {
    return this.#componentsEndpoint.getAllBy({customerId});
  }

  createComponent(component: RecoveredComponent): Observable<RecoveredComponent> {
    return this.#componentsEndpoint.create(component);
  }

  getRecuperations(): Observable<Recuperation[]> {
    return this.#recuperationsEndpoint.getAll();
  }

  createRecuperation(recuperation: Recuperation): Observable<Recuperation> {
    return this.#recuperationsEndpoint.create(recuperation);
  }

  completeRecuperation(recuperationId: number): Observable<Recuperation> {
    return this.#recuperationsEndpoint.complete(recuperationId);
  }
}
