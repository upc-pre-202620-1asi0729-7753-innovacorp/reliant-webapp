import {BaseApiEndpoint} from '../../shared/infrastructure/base-api-endpoint';
import {Recipe} from '../domain/model/recipe.entity';
import {RecipeResource, RecipesResponse} from './recipes-response';
import {RecipeAssembler} from './recipe-assembler';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

export class RecipesApiEndpoint extends BaseApiEndpoint<Recipe, RecipeResource, RecipesResponse, RecipeAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.platformProviderApiBaseUrl}${environment.platformProviderRecipesEndpointPath}`, new RecipeAssembler());
  }

  /** PATCH /recipes/{id}/publication moves a DRAFT recipe to ACTIVE and retires the previous active one. */
  publish(recipeId: number): Observable<Recipe> {
    return this.http.patch<RecipeResource>(`${this.endpointUrl}/${recipeId}/publication`, {}).pipe(
      map(resource => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to publish recipe'))
    );
  }
}
