import {BaseResource, BaseResponse} from '../../shared/infrastructure/base-response';
import {RecipeApplicability, RecipeParameter, RecipeStatus} from '../domain/model/recipe.entity';

export interface RecipesResponse extends BaseResponse { recipes: RecipeResource[]; }

export interface RecipeResource extends BaseResource {
  id: number;
  hvofSystemId: number;
  recipeNumber: number;
  name: string;
  powderSpecification: string;
  status: RecipeStatus;
  applicabilities: RecipeApplicability[];
  parameters: RecipeParameter[];
}
