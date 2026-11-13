import {ProcessReading} from './process-reading.entity';
import {RecipeParameter} from '../../../equipment/domain/model/recipe.entity';

export interface ReadingStatistics {
  count: number;
  min: number | null;
  max: number | null;
  mean: number | null;
  stdDev: number | null;
  last: number | null;
}

/** Readings grouped by parameter, each list in chronological order. */
export function groupByParameter(readings: ProcessReading[]): Map<string, ProcessReading[]> {
  const map = new Map<string, ProcessReading[]>();
  for (const r of [...readings].sort((a, b) => a.epochMillis - b.epochMillis)) {
    if (!map.has(r.parameter)) map.set(r.parameter, []);
    map.get(r.parameter)!.push(r);
  }
  return map;
}

/** Descriptive statistics of a list of readings. */
export function statisticsOf(readings: ProcessReading[]): ReadingStatistics {
  const values = readings.map(r => Number(r.value));
  const n = values.length;
  if (n === 0) return {count: 0, min: null, max: null, mean: null, stdDev: null, last: null};
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / n;
  return {count: n, min: Math.min(...values), max: Math.max(...values), mean, stdDev: Math.sqrt(variance), last: values[n - 1]};
}

/** Share of readings in the nominal band, as a percentage with one decimal; null without readings. */
export function complianceOf(readings: ProcessReading[]): number | null {
  if (readings.length === 0) return null;
  return Math.round(readings.filter(r => r.band === 'nominal').length / readings.length * 1000) / 10;
}

/** Normalizes a value against a recipe parameter so several parameters share one chart: 0 = setpoint, ±1 = shutdown limits. */
export function normalize(value: number, p: RecipeParameter | undefined): number {
  if (!p) return 0;
  const span = value >= p.setpoint ? p.upperShutdown - p.setpoint : p.setpoint - p.lowerShutdown;
  return span === 0 ? 0 : (value - p.setpoint) / span;
}

/** Duration in minutes between the start and the end (or now, while active). */
export function durationMinutes(startedAt: string, endedAt: string | null): number {
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  return Math.max(0, Math.round((end - new Date(startedAt).getTime()) / 60000));
}
