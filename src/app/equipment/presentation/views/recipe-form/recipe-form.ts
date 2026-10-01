import {Component, computed, inject} from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {BaseForm} from '../../../../shared/presentation/components/base-form/base-form';
import {Recipe, RecipeApplicability, RecipeParameter} from '../../../domain/model/recipe.entity';
import {EquipmentStore} from '../../../application/equipment.store';
import {thresholdOrderValidator} from '../../validators/threshold-order.validator';

type ApplicabilityGroup = FormGroup<{
  componentType: FormControl<string>;
  machineModel: FormControl<string>;
  position: FormControl<string>;
}>;

type ParameterGroup = FormGroup<{
  parameter: FormControl<string>;
  setpoint: FormControl<number>;
  lowerShutdown: FormControl<number>;
  lowerWarning: FormControl<number>;
  nominalMin: FormControl<number>;
  nominalMax: FormControl<number>;
  upperWarning: FormControl<number>;
  upperShutdown: FormControl<number>;
  unitSymbol: FormControl<string>;
  unitCategory: FormControl<string>;
}>;

@Component({
  selector: 'app-recipe-form',
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule, MatButtonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './recipe-form.html',
  styleUrl: './recipe-form.css'
})
export class RecipeForm extends BaseForm {
  #fb = inject(FormBuilder);
  #route = inject(ActivatedRoute);
  #router = inject(Router);
  readonly store = inject(EquipmentStore);

  readonly componentTypes = ['HYDRAULIC_ROD', 'CYLINDER_BLOCK', 'SHAFT', 'IMPELLER', 'OTHER'];
  readonly unitCategories = ['flow', 'mass_flow', 'pressure', 'temperature', 'speed', 'dimensionless'];

  systemId = 0;
  recipeId: number | null = null;
  isEdit = false;

  readonly availableParameters = computed(() => this.store.parametersOf(this.systemId)());

  form = this.#fb.group({
    recipeNumber: new FormControl<number>(0, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
    name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    powderSpecification: new FormControl<string>('', { nonNullable: true }),
    applicabilities: this.#fb.array<ApplicabilityGroup>([]),
    parameters: this.#fb.array<ParameterGroup>([], { validators: [Validators.required] })
  });

  get applicabilities(): FormArray<ApplicabilityGroup> { return this.form.controls.applicabilities; }
  get parameters(): FormArray<ParameterGroup> { return this.form.controls.parameters; }

  constructor() {
    super();
    this.#route.params.subscribe(params => {
      this.systemId = +params['id'];
      this.recipeId = params['recipeId'] ? +params['recipeId'] : null;
      this.isEdit = !!this.recipeId;
      if (this.isEdit && this.recipeId) {
        const r = this.store.getRecipeById(this.recipeId)();
        if (r) {
          this.form.patchValue({ recipeNumber: r.recipeNumber, name: r.name, powderSpecification: r.powderSpecification });
          r.applicabilities.forEach(a => this.addApplicability(a));
          r.parameters.forEach(p => this.addParameter(p));
        }
      } else {
        this.addParameter();
      }
    });
  }

  addApplicability(a?: RecipeApplicability) {
    this.applicabilities.push(this.#fb.group({
      componentType: new FormControl<string>(a?.componentType ?? 'HYDRAULIC_ROD', { nonNullable: true, validators: [Validators.required] }),
      machineModel: new FormControl<string>(a?.machineModel ?? '', { nonNullable: true, validators: [Validators.required] }),
      position: new FormControl<string>(a?.position ?? '', { nonNullable: true })
    }));
  }

  removeApplicability(index: number) {
    this.applicabilities.removeAt(index);
  }

  addParameter(p?: RecipeParameter) {
    const num = (value?: number) => new FormControl<number>(value ?? 0, { nonNullable: true, validators: [Validators.required] });
    this.parameters.push(this.#fb.group({
      parameter: new FormControl<string>(p?.parameter ?? '', { nonNullable: true, validators: [Validators.required] }),
      setpoint: num(p?.setpoint),
      lowerShutdown: num(p?.lowerShutdown),
      lowerWarning: num(p?.lowerWarning),
      nominalMin: num(p?.nominalMin),
      nominalMax: num(p?.nominalMax),
      upperWarning: num(p?.upperWarning),
      upperShutdown: num(p?.upperShutdown),
      unitSymbol: new FormControl<string>(p?.unitSymbol ?? '', { nonNullable: true, validators: [Validators.required] }),
      unitCategory: new FormControl<string>(p?.unitCategory ?? 'flow', { nonNullable: true })
    }, { validators: [thresholdOrderValidator] }));
  }

  removeParameter(index: number) {
    this.parameters.removeAt(index);
  }

  submit() {
    if (this.form.invalid) return;
    const existing = this.recipeId ? this.store.getRecipeById(this.recipeId)() : undefined;
    const v = this.form.getRawValue();
    const recipe = new Recipe({
      id: this.recipeId ?? 0,
      hvofSystemId: this.systemId,
      recipeNumber: v.recipeNumber,
      name: v.name,
      powderSpecification: v.powderSpecification,
      status: existing?.status ?? 'DRAFT',
      applicabilities: v.applicabilities,
      parameters: v.parameters
    });
    if (this.isEdit) {
      this.store.updateRecipe(recipe);
    } else {
      this.store.addRecipe(recipe);
    }
    this.back();
  }

  back() {
    this.#router.navigate(['equipment/hvof-systems', this.systemId]).then();
  }
}
