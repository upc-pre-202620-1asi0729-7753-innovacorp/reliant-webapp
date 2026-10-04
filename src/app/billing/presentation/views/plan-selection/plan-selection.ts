import {Component, inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {CurrencyPipe} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatError} from '@angular/material/form-field';
import {TranslatePipe} from '@ngx-translate/core';
import {BillingStore} from '../../../application/billing.store';
import {Plan} from '../../../domain/model/plan.entity';

@Component({
  selector: 'app-plan-selection',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatError, TranslatePipe, CurrencyPipe],
  templateUrl: './plan-selection.html',
  styleUrl: './plan-selection.css'
})
export class PlanSelection implements OnInit {
  readonly store = inject(BillingStore);
  #router = inject(Router);

  ngOnInit() {
    this.store.load();
  }

  select(plan: Plan) {
    this.store.selectPlan(plan, () => this.#router.navigate(['billing/subscription']).then());
  }
}
