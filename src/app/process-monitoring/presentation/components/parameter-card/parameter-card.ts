import {Component, input} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {TranslatePipe} from '@ngx-translate/core';
import {ProcessReading} from '../../../domain/model/process-reading.entity';
import {RecipeParameter} from '../../../../equipment/domain/model/recipe.entity';

@Component({
  selector: 'app-parameter-card',
  imports: [MatCardModule, TranslatePipe, DecimalPipe],
  templateUrl: './parameter-card.html',
  styleUrl: './parameter-card.css'
})
export class ParameterCard {
  readonly reading = input.required<ProcessReading>();
  readonly recipeParameter = input<RecipeParameter | undefined>();
}
