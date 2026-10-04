import {computed, inject, Injectable, Signal, signal} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {retry} from 'rxjs';
import {HvofSystem} from '../domain/model/hvof-system.entity';
import {Controller} from '../domain/model/controller.entity';
import {EquipmentApi} from '../infrastructure/equipment-api';
import {HvofPart} from '../domain/model/hvof-part.entity';
import {HvofSubsystem} from '../domain/model/hvof-subsystem.entity';
import {Recipe} from '../domain/model/recipe.entity';
import {IamStore} from '../../iam/application/iam.store';

@Injectable({
  providedIn: 'root'
})
export class EquipmentStore {
  readonly #api = inject(EquipmentApi);

  readonly #hvofSystemsSignal = signal<HvofSystem[]>([]);
  readonly hvofSystems = this.#hvofSystemsSignal.asReadonly();
  readonly activeHvofSystems = computed(() => this.hvofSystems().filter(s => s.status === 'ACTIVE'));

  readonly #controllersSignal = signal<Controller[]>([]);
  readonly controllers = this.#controllersSignal.asReadonly();

  readonly #loadingSignal = signal<boolean>(false);
  readonly loading = this.#loadingSignal.asReadonly();
  readonly #errorSignal = signal<string | null>(null);
  readonly error = this.#errorSignal.asReadonly();

  readonly #subsystemsSignal = signal<HvofSubsystem[]>([]);
  readonly subsystems = this.#subsystemsSignal.asReadonly();
  readonly #partsSignal = signal<HvofPart[]>([]);
  readonly parts = this.#partsSignal.asReadonly();

  readonly #recipesSignal = signal<Recipe[]>([]);
  readonly recipes = this.#recipesSignal.asReadonly();

  readonly #iam = inject(IamStore);

  constructor() {
    this.#loadHvofSystems();
    this.#loadControllers();
    this.#loadSubsystems();
    this.#loadParts();
    this.#loadRecipes();
  }

  getHvofSystemById(id: number): Signal<HvofSystem | undefined> {
    return computed(() => id ? this.hvofSystems().find(s => s.id === id) : undefined);
  }

  controllersOf(hvofSystemId: number): Signal<Controller[]> {
    return computed(() => this.controllers().filter(c => c.hvofSystemId === hvofSystemId));
  }

  getControllerById(id: number): Signal<Controller | undefined> {
    return computed(() => id ? this.controllers().find(c => c.id === id) : undefined);
  }

  addHvofSystem(system: HvofSystem): void {
    this.#run(this.#api.createHvofSystem(system), created =>
      this.#hvofSystemsSignal.update(list => [...list, created]), 'Failed to create HVOF system');
  }

  updateHvofSystem(system: HvofSystem): void {
    this.#run(this.#api.updateHvofSystem(system), updated =>
      this.#hvofSystemsSignal.update(list => list.map(s => s.id === updated.id ? updated : s)), 'Failed to update HVOF system');
  }

  addController(controller: Controller): void {
    this.#run(this.#api.createController(controller), created =>
      this.#controllersSignal.update(list => [...list, created]), 'Failed to create controller');
  }

  updateController(controller: Controller): void {
    this.#run(this.#api.updateController(controller), updated =>
      this.#controllersSignal.update(list => list.map(c => c.id === updated.id ? updated : c)), 'Failed to update controller');
  }

  #run<T>(request: import('rxjs').Observable<T>, onNext: (value: T) => void, fallback: string): void {
    this.#loadingSignal.set(true);
    this.#errorSignal.set(null);
    request.pipe(retry(2)).subscribe({
      next: value => {
        onNext(value);
        this.#loadingSignal.set(false);
      },
      error: err => {
        this.#errorSignal.set(this.#formatError(err, fallback));
        this.#loadingSignal.set(false);
      }
    });
  }

  #loadHvofSystems(): void {
    const organizationId = this.#iam.organizationId();
    if (!organizationId) return;
    this.#loadingSignal.set(true);
    this.#api.getHvofSystemsByOrganizationId(organizationId).pipe(takeUntilDestroyed()).subscribe({
      next: systems => {
        this.#hvofSystemsSignal.set(systems);
        this.#loadingSignal.set(false);
      },
      error: err => {
        this.#errorSignal.set(this.#formatError(err, 'Failed to load HVOF systems'));
        this.#loadingSignal.set(false);
      }
    });
  }

  #loadControllers(): void {
    this.#api.getControllers().pipe(takeUntilDestroyed()).subscribe({
      next: controllers => this.#controllersSignal.set(controllers),
      error: err => this.#errorSignal.set(this.#formatError(err, 'Failed to load controllers'))
    });
  }

  subsystemsOf(hvofSystemId: number): Signal<HvofSubsystem[]> {
    return computed(() => this.subsystems().filter(s => s.hvofSystemId === hvofSystemId));
  }

  getSubsystemById(id: number): Signal<HvofSubsystem | undefined> {
    return computed(() => id ? this.subsystems().find(s => s.id === id) : undefined);
  }

  partsOf(subsystemId: number): Signal<HvofPart[]> {
    return computed(() => this.parts().filter(p => p.hvofSubsystemId === subsystemId));
  }

  parametersOf(hvofSystemId: number): Signal<string[]> {
    return computed(() => [...new Set(this.subsystemsOf(hvofSystemId)().flatMap(s => s.parameters.map(p => p.parameter)))]);
  }

  addSubsystem(subsystem: HvofSubsystem): void {
    this.#run(this.#api.createSubsystem(subsystem), created =>
      this.#subsystemsSignal.update(list => [...list, created]), 'Failed to create subsystem');
  }

  updateSubsystem(subsystem: HvofSubsystem): void {
    this.#run(this.#api.updateSubsystem(subsystem), updated =>
      this.#subsystemsSignal.update(list => list.map(s => s.id === updated.id ? updated : s)), 'Failed to update subsystem');
  }

  addPart(part: HvofPart): void {
    this.#run(this.#api.createPart(part), created =>
      this.#partsSignal.update(list => [...list, created]), 'Failed to create part');
  }

  deletePart(id: number): void {
    this.#run(this.#api.deletePart(id), () =>
      this.#partsSignal.update(list => list.filter(p => p.id !== id)), 'Failed to delete part');
  }

  #loadSubsystems(): void {
    this.#api.getSubsystems().pipe(takeUntilDestroyed()).subscribe({
      next: subsystems => this.#subsystemsSignal.set(subsystems),
      error: err => this.#errorSignal.set(this.#formatError(err, 'Failed to load subsystems'))
    });
  }

  #loadParts(): void {
    this.#api.getParts().pipe(takeUntilDestroyed()).subscribe({
      next: parts => this.#partsSignal.set(parts),
      error: err => this.#errorSignal.set(this.#formatError(err, 'Failed to load parts'))
    });
  }

  #formatError(error: unknown, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found') ? `${fallback}: Not found` : error.message;
    }
    return fallback;
  }

  recipesOf(hvofSystemId: number): Signal<Recipe[]> {
    return computed(() => this.recipes().filter(r => r.hvofSystemId === hvofSystemId));
  }

  activeRecipesOf(hvofSystemId: number): Signal<Recipe[]> {
    return computed(() => this.recipesOf(hvofSystemId)().filter(r => r.status === 'ACTIVE'));
  }

  getRecipeById(id: number): Signal<Recipe | undefined> {
    return computed(() => id ? this.recipes().find(r => r.id === id) : undefined);
  }

  recipeByNumber(hvofSystemId: number, recipeNumber: number): Signal<Recipe | undefined> {
    return computed(() => this.recipesOf(hvofSystemId)().find(r => r.recipeNumber === recipeNumber));
  }

  addRecipe(recipe: Recipe): void {
    this.#run(this.#api.createRecipe(recipe), created =>
      this.#recipesSignal.update(list => [...list, created]), 'Failed to create recipe');
  }

  updateRecipe(recipe: Recipe): void {
    this.#run(this.#api.updateRecipe(recipe), updated =>
      this.#recipesSignal.update(list => list.map(r => r.id === updated.id ? updated : r)), 'Failed to update recipe');
  }

  publishRecipe(id: number): void {
    const recipe = this.getRecipeById(id)();
    if (!recipe) return;
    recipe.status = 'ACTIVE';
    this.updateRecipe(recipe);
  }

  #loadRecipes(): void {
    this.#api.getRecipes().pipe(takeUntilDestroyed()).subscribe({
      next: recipes => this.#recipesSignal.set(recipes),
      error: err => this.#errorSignal.set(this.#formatError(err, 'Failed to load recipes'))
    });
  }
}
