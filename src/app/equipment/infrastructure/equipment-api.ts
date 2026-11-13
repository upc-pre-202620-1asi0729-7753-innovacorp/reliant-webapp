import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {HvofSystem} from '../domain/model/hvof-system.entity';
import {Controller} from '../domain/model/controller.entity';
import {HvofSystemsApiEndpoint} from './hvof-systems-api-endpoint';
import {ControllersApiEndpoint} from './controllers-api-endpoint';
import {HvofSubsystemsApiEndpoint} from './hvof-subsystems-api-endpoint';
import {HvofSubsystem} from '../domain/model/hvof-subsystem.entity';
import {Recipe} from '../domain/model/recipe.entity';
import {RecipesApiEndpoint} from './recipes-api-endpoint';

@Injectable({providedIn: 'root'})
export class EquipmentApi extends BaseApi {
  readonly #hvofSystemsEndpoint = new HvofSystemsApiEndpoint(this.http);
  readonly #controllersEndpoint = new ControllersApiEndpoint(this.http);
  readonly #subsystemsEndpoint = new HvofSubsystemsApiEndpoint(this.http);
  readonly #recipesEndpoint = new RecipesApiEndpoint(this.http);

  getHvofSystemsByOrganizationId(organizationId: number): Observable<HvofSystem[]> {
    return this.#hvofSystemsEndpoint.getAllBy({organizationId});
  }

  getHvofSystem(id: number): Observable<HvofSystem> {
    return this.#hvofSystemsEndpoint.getById(id);
  }

  createHvofSystem(system: HvofSystem): Observable<HvofSystem> {
    return this.#hvofSystemsEndpoint.create(system);
  }

  getControllersBySystemId(hvofSystemId: number): Observable<Controller[]> {
    return this.#controllersEndpoint.getAllBySystemId(hvofSystemId);
  }

  createController(controller: Controller): Observable<Controller> {
    return this.#controllersEndpoint.create(controller);
  }

  getSubsystemsBySystemId(hvofSystemId: number): Observable<HvofSubsystem[]> {
    return this.#subsystemsEndpoint.getAllBySystemId(hvofSystemId);
  }

  createSubsystem(subsystem: HvofSubsystem): Observable<HvofSubsystem> {
    return this.#subsystemsEndpoint.create(subsystem);
  }

  getRecipesBySystemId(hvofSystemId: number): Observable<Recipe[]> {
    return this.#recipesEndpoint.getAllBy({hvofSystemId});
  }

  createRecipe(recipe: Recipe): Observable<Recipe> {
    return this.#recipesEndpoint.create(recipe);
  }

  publishRecipe(recipeId: number): Observable<Recipe> {
    return this.#recipesEndpoint.publish(recipeId);
  }
}
