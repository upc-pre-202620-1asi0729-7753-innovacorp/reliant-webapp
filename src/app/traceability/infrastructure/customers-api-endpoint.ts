import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {Customer} from '../domain/model/customer.entity';
import {CustomerResource, CustomersResponse} from './customers-response';
import {CustomerAssembler} from './customer-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

export class CustomersApiEndpoint extends BaseApiEndpoint<Customer, CustomerResource, CustomersResponse, CustomerAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderCustomersEndpointPath}`, new CustomerAssembler());
  }
}
