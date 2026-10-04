import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {Recipe} from '../domain/model/recipe.entity';
import {RecipeResource, RecipesResponse} from './recipes-response';
import {RecipeAssembler} from './recipe-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';

export class RecipesApiEndpoint extends BaseApiEndpoint<Recipe, RecipeResource, RecipesResponse, RecipeAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderRecipesEndpointPath}`, new RecipeAssembler());
  }
}
