import {inject, Injectable, signal} from '@angular/core';
import {catchError, concatMap, forkJoin, map, Observable, of, switchMap, tap, throwError} from 'rxjs';
import {EquipmentApi} from '../../equipment/infrastructure/equipment-api';
import {TraceabilityApi} from '../../traceability/infrastructure/traceability-api';
import {ProcessMonitoringApi} from '../../process-monitoring/infrastructure/process-monitoring-api';
import {EquipmentStore} from '../../equipment/application/equipment.store';
import {TraceabilityStore} from '../../traceability/application/traceability.store';
import {ProcessMonitoringStore} from '../../process-monitoring/application/process-monitoring.store';
import {IamStore} from '../../iam/application/iam.store';
import {HvofSystem} from '../../equipment/domain/model/hvof-system.entity';
import {HvofSubsystem} from '../../equipment/domain/model/hvof-subsystem.entity';
import {Controller} from '../../equipment/domain/model/controller.entity';
import {Recipe} from '../../equipment/domain/model/recipe.entity';
import {Customer} from '../../traceability/domain/model/customer.entity';
import {RecoveredComponent} from '../../traceability/domain/model/component.entity';
import {Recuperation} from '../../traceability/domain/model/recuperation.entity';
import {SpraySession} from '../../process-monitoring/domain/model/spray-session.entity';
import {DEMO_PLANT, QUICK_START_STEPS, QuickStartStep} from '../domain/model/demo-plant';

export type StepState = 'pending' | 'running' | 'done' | 'reused' | 'failed';

function initialSteps(): Record<QuickStartStep, StepState> {
  return Object.fromEntries(QUICK_START_STEPS.map(s => [s, 'pending'])) as Record<QuickStartStep, StepState>;
}

/**
 * Provisions the demo plant in the platform and starts a spray session, step by step.
 * Each step looks for the record by its natural key before creating it, so running the quick start twice
 * reuses the plant instead of duplicating it.
 */
@Injectable({providedIn: 'root'})
export class QuickStartService {
  readonly #equipmentApi = inject(EquipmentApi);
  readonly #traceabilityApi = inject(TraceabilityApi);
  readonly #monitoringApi = inject(ProcessMonitoringApi);
  readonly #equipment = inject(EquipmentStore);
  readonly #traceability = inject(TraceabilityStore);
  readonly #monitoring = inject(ProcessMonitoringStore);
  readonly #iam = inject(IamStore);

  readonly #stepsSignal = signal<Record<QuickStartStep, StepState>>(initialSteps());
  readonly steps = this.#stepsSignal.asReadonly();
  readonly #runningSignal = signal(false);
  readonly running = this.#runningSignal.asReadonly();
  readonly #errorSignal = signal<string | null>(null);
  readonly error = this.#errorSignal.asReadonly();
  readonly #sessionIdSignal = signal<number | null>(null);
  readonly sessionId = this.#sessionIdSignal.asReadonly();

  reset(): void {
    this.#stepsSignal.set(initialSteps());
    this.#errorSignal.set(null);
    this.#sessionIdSignal.set(null);
  }

  /** Runs every step in order; resolves with the id of the started session. */
  run(): void {
    const organizationId = this.#iam.organizationId();
    if (!organizationId || this.running()) return;
    this.reset();
    this.#runningSignal.set(true);

    this.#step('hvof-system', this.#ensureSystem(organizationId)).pipe(
      switchMap(system => this.#step('subsystems', this.#ensureSubsystems(system)).pipe(map(() => system))),
      switchMap(system => this.#step('controller', this.#ensureController(system)).pipe(map(() => system))),
      switchMap(system => this.#step('recipe', this.#ensureRecipe(system)).pipe(map(recipe => ({system, recipe})))),
      switchMap(ctx => this.#step('customer', this.#ensureCustomer(organizationId)).pipe(map(customer => ({...ctx, customer})))),
      switchMap(ctx => this.#step('component', this.#ensureComponent(ctx.customer)).pipe(map(component => ({...ctx, component})))),
      switchMap(ctx => this.#step('recuperation', this.#ensureRecuperation(organizationId, ctx.customer, ctx.component)).pipe(map(recuperation => ({...ctx, recuperation})))),
      switchMap(ctx => this.#step('session', this.#startSession(ctx.system, ctx.recipe, ctx.recuperation)))
    ).subscribe({
      next: session => {
        this.#sessionIdSignal.set(session.id);
        this.#runningSignal.set(false);
        this.#equipment.reload();
        this.#traceability.reload();
        this.#monitoring.reload();
      },
      error: (err: Error) => {
        this.#errorSignal.set(err.message);
        this.#runningSignal.set(false);
        this.#equipment.reload();
        this.#traceability.reload();
      }
    });
  }

  #step<T>(step: QuickStartStep, work: Observable<{value: T; reused: boolean}>): Observable<T> {
    this.#setStep(step, 'running');
    return work.pipe(
      tap(({reused}) => this.#setStep(step, reused ? 'reused' : 'done')),
      map(({value}) => value),
      catchError((err: Error) => {
        this.#setStep(step, 'failed');
        return throwError(() => err);
      })
    );
  }

  #setStep(step: QuickStartStep, state: StepState): void {
    this.#stepsSignal.update(steps => ({...steps, [step]: state}));
  }

  #ensureSystem(organizationId: number) {
    const plant = DEMO_PLANT.hvofSystem;
    return this.#equipmentApi.getHvofSystemsByOrganizationId(organizationId).pipe(
      switchMap(systems => {
        const existing = systems.find(s => s.code === plant.code);
        if (existing) return of({value: existing, reused: true});
        const system = new HvofSystem({id: 0, organizationId, status: 'ACTIVE', tagMappings: [], ...plant});
        return this.#equipmentApi.createHvofSystem(system).pipe(map(value => ({value, reused: false})));
      })
    );
  }

  #ensureSubsystems(system: HvofSystem) {
    return this.#equipmentApi.getSubsystemsBySystemId(system.id).pipe(
      switchMap(existing => {
        const missing = DEMO_PLANT.subsystems.filter(s => !existing.some(e => e.name === s.name));
        if (missing.length === 0) return of({value: existing, reused: true});
        return forkJoin(missing.map(s => this.#equipmentApi.createSubsystem(new HvofSubsystem({
          id: 0, hvofSystemId: system.id, subsystemType: s.subsystemType, name: s.name, alias: s.alias,
          parameters: s.parameters.map(parameter => ({parameter}))
        })))).pipe(map(created => ({value: [...existing, ...created], reused: false})));
      })
    );
  }

  #ensureController(system: HvofSystem) {
    return this.#equipmentApi.getControllersBySystemId(system.id).pipe(
      switchMap(existing => {
        const found = existing.find(c => c.controllerNumber === DEMO_PLANT.controller.controllerNumber);
        if (found) return of({value: found, reused: true});
        const c = DEMO_PLANT.controller;
        return this.#equipmentApi.createController(new Controller({
          id: 0, hvofSystemId: system.id, controllerNumber: c.controllerNumber, deviceType: c.deviceType, serialNumber: c.serialNumber,
          manufacturer: c.manufacturer, model: c.model, partNumber: c.partNumber, ipAddress: c.ipAddress, port: c.port, rack: c.rack, slot: c.slot,
          endpointUrl: c.endpointUrl, tagCatalogId: c.tagCatalogId, supportedProtocols: [...c.supportedProtocols]
        })).pipe(map(value => ({value, reused: false})));
      })
    );
  }

  /** Reuses the active recipe #12; publishes a draft one if that is what exists; creates and publishes otherwise. */
  #ensureRecipe(system: HvofSystem) {
    const plant = DEMO_PLANT.recipe;
    return this.#equipmentApi.getRecipesBySystemId(system.id).pipe(
      switchMap(recipes => {
        const sameNumber = recipes.filter(r => r.recipeNumber === plant.recipeNumber);
        const active = sameNumber.find(r => r.status === 'ACTIVE');
        if (active) return of({value: active, reused: true});
        const draft = sameNumber.find(r => r.status === 'DRAFT');
        if (draft) return this.#equipmentApi.publishRecipe(draft.id).pipe(map(value => ({value, reused: false})));
        const recipe = new Recipe({
          id: 0, hvofSystemId: system.id, recipeNumber: plant.recipeNumber, name: plant.name, powderSpecification: plant.powderSpecification,
          status: 'DRAFT', applicabilities: [...plant.applicabilities], parameters: plant.parameters.map(p => ({...p}))
        });
        return this.#equipmentApi.createRecipe(recipe).pipe(
          concatMap(created => this.#equipmentApi.publishRecipe(created.id)),
          map(value => ({value, reused: false}))
        );
      })
    );
  }

  #ensureCustomer(organizationId: number) {
    const plant = DEMO_PLANT.customer;
    return this.#traceabilityApi.getCustomers().pipe(
      switchMap(customers => {
        const existing = customers.find(c => c.ruc === plant.ruc);
        if (existing) return of({value: existing, reused: true});
        return this.#traceabilityApi.createCustomer(new Customer({
          id: 0, supplierOrganizationId: organizationId, linkedAssetOwnerOrganizationId: null, ...plant
        })).pipe(map(value => ({value, reused: false})));
      })
    );
  }

  #ensureComponent(customer: Customer) {
    const plant = DEMO_PLANT.component;
    return this.#traceabilityApi.getComponentsByCustomerId(customer.id).pipe(
      switchMap(components => {
        const existing = components.find(c => c.serialNumber === plant.serialNumber);
        if (existing) return of({value: existing, reused: true});
        return this.#traceabilityApi.createComponent(new RecoveredComponent({id: 0, customerId: customer.id, status: 'RECEIVED', ...plant}))
          .pipe(map(value => ({value, reused: false})));
      })
    );
  }

  /** Reuses the open demo order; when it was already completed, opens a new one with a numbered suffix. */
  #ensureRecuperation(organizationId: number, customer: Customer, component: RecoveredComponent) {
    const plant = DEMO_PLANT.recuperation;
    return this.#traceabilityApi.getRecuperations().pipe(
      switchMap(recuperations => {
        const open = recuperations.find(r => r.workOrderNumber.startsWith(plant.workOrderNumber) && r.status !== 'COMPLETED' && r.status !== 'DELIVERED');
        if (open) return of({value: open, reused: true});
        const used = recuperations.filter(r => r.workOrderNumber.startsWith(plant.workOrderNumber)).length;
        const workOrderNumber = used === 0 ? plant.workOrderNumber : `${plant.workOrderNumber}-${used + 1}`;
        return this.#traceabilityApi.createRecuperation(new Recuperation({
          id: 0, workOrderNumber, manufacturingOrderNumber: plant.manufacturingOrderNumber, componentId: component.id, customerId: customer.id,
          supplierOrganizationId: organizationId, segment: plant.segment, operation: plant.operation, weightValue: plant.weightValue,
          weightUnitSymbol: plant.weightUnitSymbol, hourmeterAtEntry: plant.hourmeterAtEntry, powderSupplier: plant.powderSupplier,
          powderLotNumber: plant.powderLotNumber, powderChemicalComposition: plant.powderChemicalComposition, status: 'RECEIVED',
          receivedAt: new Date().toISOString().slice(0, 10), completedAt: null, linkedSessions: []
        })).pipe(map(value => ({value, reused: false})));
      })
    );
  }

  #startSession(system: HvofSystem, recipe: Recipe, recuperation: Recuperation) {
    return this.#monitoringApi.getSessions().pipe(
      switchMap(sessions => {
        const active = sessions.find(s => s.recuperationId === recuperation.id && s.isActive);
        if (active) return of({value: active, reused: true});
        return this.#monitoringApi.startSession(new SpraySession({
          id: 0, hvofSystemId: system.id, recuperationId: recuperation.id, operatorId: this.#iam.userId()!, recipeNumber: recipe.recipeNumber,
          startedAt: new Date().toISOString(), endedAt: null, timeZone: 'America/Lima', status: 'active'
        })).pipe(map(value => ({value, reused: false})));
      })
    );
  }
}
