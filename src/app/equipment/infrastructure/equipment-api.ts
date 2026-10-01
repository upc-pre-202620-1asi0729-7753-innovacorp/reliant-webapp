import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {HvofSystem} from '../domain/model/hvof-system.entity';
import {Controller} from '../domain/model/controller.entity';
import {HvofSystemsApiEndpoint} from './hvof-systems-api-endpoint';
import {ControllersApiEndpoint} from './controllers-api-endpoint';

@Injectable({providedIn: 'root'})
export class EquipmentApi extends BaseApi {
  readonly #hvofSystemsEndpoint = new HvofSystemsApiEndpoint(this.http);
  readonly #controllersEndpoint = new ControllersApiEndpoint(this.http);

  getHvofSystems(): Observable<HvofSystem[]> {
    return this.#hvofSystemsEndpoint.getAll();
  }

  createHvofSystem(system: HvofSystem): Observable<HvofSystem> {
    return this.#hvofSystemsEndpoint.create(system);
  }

  updateHvofSystem(system: HvofSystem): Observable<HvofSystem> {
    return this.#hvofSystemsEndpoint.update(system, system.id);
  }

  getControllers(): Observable<Controller[]> {
    return this.#controllersEndpoint.getAll();
  }

  getControllersBySystemId(hvofSystemId: number): Observable<Controller[]> {
    return this.#controllersEndpoint.getAllBy({hvofSystemId});
  }

  createController(controller: Controller): Observable<Controller> {
    return this.#controllersEndpoint.create(controller);
  }

  updateController(controller: Controller): Observable<Controller> {
    return this.#controllersEndpoint.update(controller, controller.id);
  }
}
