import {computed, inject, Injectable, Signal, signal} from '@angular/core';
import {forkJoin, Observable, of, retry} from 'rxjs';
import {HvofSystem} from '../domain/model/hvof-system.entity';
import {Controller} from '../domain/model/controller.entity';
import {EquipmentApi} from '../infrastructure/equipment-api';
import {HvofSubsystem} from '../domain/model/hvof-subsystem.entity';
import {Recipe} from '../domain/model/recipe.entity';
import {IamStore} from '../../iam/application/iam.store';

/**
 * Equipment of the signed-in organization. Systems are loaded first; subsystems, controllers and
 * recipes hang from each system in the platform, so they are fetched per system afterwards.
 */
@Injectable({providedIn: 'root'})
export class EquipmentStore {
  readonly #api = inject(EquipmentApi);
  readonly #iam = inject(IamStore);

  readonly #hvofSystemsSignal = signal<HvofSystem[]>([]);
  readonly hvofSystems = this.#hvofSystemsSignal.asReadonly();
  readonly activeHvofSystems = computed(() => this.hvofSystems().filter(s => s.status === 'ACTIVE'));

  readonly #controllersSignal = signal<Controller[]>([]);
  readonly controllers = this.#controllersSignal.asReadonly();

  readonly #subsystemsSignal = signal<HvofSubsystem[]>([]);
  readonly subsystems = this.#subsystemsSignal.asReadonly();

  readonly #recipesSignal = signal<Recipe[]>([]);
  readonly recipes = this.#recipesSignal.asReadonly();

  readonly #loadingSignal = signal<boolean>(false);
  readonly loading = this.#loadingSignal.asReadonly();
  readonly #errorSignal = signal<string | null>(null);
  readonly error = this.#errorSignal.asReadonly();
  readonly #loadedSignal = signal<boolean>(false);
  readonly loaded = this.#loadedSignal.asReadonly();

  constructor() {
    this.reload();
  }

  reload(): void {
    const organizationId = this.#iam.organizationId();
    this.#loadedSignal.set(false);
    if (!organizationId) {
      this.#hvofSystemsSignal.set([]);
      this.#controllersSignal.set([]);
      this.#subsystemsSignal.set([]);
      this.#recipesSignal.set([]);
      return;
    }
    this.#loadingSignal.set(true);
    this.#errorSignal.set(null);
    this.#api.getHvofSystemsByOrganizationId(organizationId).subscribe({
      next: systems => {
        this.#hvofSystemsSignal.set(systems);
        this.#loadChildren(systems);
      },
      error: err => {
        this.#errorSignal.set(this.#formatError(err, 'Failed to load HVOF systems'));
        this.#loadingSignal.set(false);
      }
    });
  }

  /** Subsystems, controllers and recipes of every system, in parallel. */
  #loadChildren(systems: HvofSystem[]): void {
    if (systems.length === 0) {
      this.#controllersSignal.set([]);
      this.#subsystemsSignal.set([]);
      this.#recipesSignal.set([]);
      this.#loadingSignal.set(false);
      this.#loadedSignal.set(true);
      return;
    }
    const ids = systems.map(s => s.id);
    forkJoin({
      subsystems: forkJoin(ids.map(id => this.#api.getSubsystemsBySystemId(id))),
      controllers: forkJoin(ids.map(id => this.#api.getControllersBySystemId(id))),
      recipes: forkJoin(ids.map(id => this.#api.getRecipesBySystemId(id)))
    }).subscribe({
      next: ({subsystems, controllers, recipes}) => {
        this.#subsystemsSignal.set(subsystems.flat());
        this.#controllersSignal.set(controllers.flat());
        this.#recipesSignal.set(recipes.flat());
        this.#loadingSignal.set(false);
        this.#loadedSignal.set(true);
      },
      error: err => {
        this.#errorSignal.set(this.#formatError(err, 'Failed to load equipment'));
        this.#loadingSignal.set(false);
        this.#loadedSignal.set(true);
      }
    });
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

  subsystemsOf(hvofSystemId: number): Signal<HvofSubsystem[]> {
    return computed(() => this.subsystems().filter(s => s.hvofSystemId === hvofSystemId));
  }

  getSubsystemById(id: number): Signal<HvofSubsystem | undefined> {
    return computed(() => id ? this.subsystems().find(s => s.id === id) : undefined);
  }

  parametersOf(hvofSystemId: number): Signal<string[]> {
    return computed(() => [...new Set(this.subsystemsOf(hvofSystemId)().flatMap(s => s.parameters.map(p => p.parameter)))]);
  }

  /** Subsystem that owns a parameter, used to tag readings with their source. */
  subsystemOfParameter(hvofSystemId: number, parameter: string): HvofSubsystem | undefined {
    return this.subsystemsOf(hvofSystemId)().find(s => s.parameters.some(p => p.parameter === parameter));
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
    return computed(() => {
      const candidates = this.recipesOf(hvofSystemId)().filter(r => r.recipeNumber === recipeNumber);
      return candidates.find(r => r.status === 'ACTIVE') ?? candidates[0];
    });
  }

  addHvofSystem(system: HvofSystem, onCreated?: (created: HvofSystem) => void): void {
    this.#run(this.#api.createHvofSystem(system), created => {
      this.#hvofSystemsSignal.update(list => [...list, created]);
      onCreated?.(created);
    }, 'Failed to register HVOF system');
  }

  addController(controller: Controller): void {
    this.#run(this.#api.createController(controller), created =>
      this.#controllersSignal.update(list => [...list, created]), 'Failed to register controller');
  }

  addSubsystem(subsystem: HvofSubsystem): void {
    this.#run(this.#api.createSubsystem(subsystem), created =>
      this.#subsystemsSignal.update(list => [...list, created]), 'Failed to register subsystem');
  }

  addRecipe(recipe: Recipe): void {
    this.#run(this.#api.createRecipe(recipe), created =>
      this.#recipesSignal.update(list => [...list, created]), 'Failed to create recipe');
  }

  publishRecipe(id: number): void {
    const recipe = this.getRecipeById(id)();
    if (!recipe) return;
    this.#run(this.#api.publishRecipe(id), published => {
      this.#recipesSignal.update(list => list.map(r => {
        if (r.id === published.id) return published;
        if (r.hvofSystemId === published.hvofSystemId && r.recipeNumber === published.recipeNumber && r.status === 'ACTIVE') {
          r.status = 'RETIRED';
        }
        return r;
      }));
    }, 'Failed to publish recipe');
  }

  #run<T>(request: Observable<T>, onNext: (value: T) => void, fallback: string): void {
    this.#loadingSignal.set(true);
    this.#errorSignal.set(null);
    request.pipe(retry({count: 1, delay: 300})).subscribe({
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

  #formatError(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
  }
}
