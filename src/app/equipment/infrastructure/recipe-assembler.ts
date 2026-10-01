import {BaseAssembler} from '../../shared/infrastructure/base-assembler';
import {Recipe} from '../domain/model/recipe.entity';
import {RecipeResource, RecipesResponse} from './recipes-response';

export class RecipeAssembler implements BaseAssembler<Recipe, RecipeResource, RecipesResponse> {
  toEntitiesFromResponse(response: RecipesResponse): Recipe[] {
    return response.recipes.map(r => this.toEntityFromResource(r));
  }
  toEntityFromResource(r: RecipeResource): Recipe {
    return new Recipe({
      id: r.id, hvofSystemId: r.hvofSystemId, recipeNumber: r.recipeNumber, name: r.name,
      powderSpecification: r.powderSpecification, status: r.status,
      applicabilities: r.applicabilities ?? [], parameters: r.parameters ?? []
    });
  }
  toResourceFromEntity(e: Recipe): RecipeResource {
    return {
      id: e.id, hvofSystemId: e.hvofSystemId, recipeNumber: e.recipeNumber, name: e.name,
      powderSpecification: e.powderSpecification, status: e.status,
      applicabilities: e.applicabilities, parameters: e.parameters
    } as RecipeResource;
  }
}
