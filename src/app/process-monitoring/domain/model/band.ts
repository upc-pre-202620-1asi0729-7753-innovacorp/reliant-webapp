import {RecipeParameter} from '../../../equipment/domain/model/recipe.entity';
import {Band} from './process-reading.entity';

export function classify(value: number, p: RecipeParameter): Band {
  if (value < p.lowerShutdown || value > p.upperShutdown) return 'shutdown';
  if (value < p.lowerWarning  || value > p.upperWarning)  return 'warning';
  if (value < p.nominalMin    || value > p.nominalMax)    return 'out_of_nominal';
  return 'nominal';
}

export const BAND_ORDER: Band[] = ['nominal', 'out_of_nominal', 'warning', 'shutdown'];
