import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {HvofSystem} from '../domain/model/hvof-system.entity';
import {Controller} from '../domain/model/controller.entity';
import {HvofSystemsApiEndpoint} from './hvof-systems-api-endpoint';
import {ControllersApiEndpoint} from './controllers-api-endpoint';
import {HvofSubsystemsApiEndpoint} from './hvof-subsystems-api-endpoint';
import {HvofPartsApiEndpoint} from './hvof-parts-api-endpoint';
import {HvofSubsystem} from '../domain/model/hvof-subsystem.entity';
import {HvofPart} from '../domain/model/hvof-part.entity';
import {Recipe} from '../domain/model/recipe.entity';
import {RecipesApiEndpoint} from './recipes-api-endpoint';

@Injectable({providedIn: 'root'})
export class EquipmentApi extends BaseApi {
  readonly #hvofSystemsEndpoint = new HvofSystemsApiEndpoint(this.http);
  readonly #controllersEndpoint = new ControllersApiEndpoint(this.http);
  readonly #subsystemsEndpoint = new HvofSubsystemsApiEndpoint(this.http);
  readonly #partsEndpoint = new HvofPartsApiEndpoint(this.http);

  readonly #recipesEndpoint = new RecipesApiEndpoint(this.http);

  getRecipes(): Observable<Recipe[]> { return this.#recipesEndpoint.getAll(); }
  createRecipe(r: Recipe): Observable<Recipe> { return this.#recipesEndpoint.create(r); }
  updateRecipe(r: Recipe): Observable<Recipe> { return this.#recipesEndpoint.update(r, r.id); }

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

  getSubsystems(): Observable<HvofSubsystem[]> { return this.#subsystemsEndpoint.getAll(); }
  createSubsystem(s: HvofSubsystem): Observable<HvofSubsystem> { return this.#subsystemsEndpoint.create(s); }
  updateSubsystem(s: HvofSubsystem): Observable<HvofSubsystem> { return this.#subsystemsEndpoint.update(s, s.id); }

  getParts(): Observable<HvofPart[]> { return this.#partsEndpoint.getAll(); }
  createPart(p: HvofPart): Observable<HvofPart> { return this.#partsEndpoint.create(p); }
  deletePart(id: number): Observable<void> { return this.#partsEndpoint.delete(id); }
}
