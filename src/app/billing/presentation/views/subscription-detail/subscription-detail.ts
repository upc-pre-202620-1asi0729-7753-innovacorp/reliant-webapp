import {Component, inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {DatePipe} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatChipsModule} from '@angular/material/chips';
import {TranslatePipe} from '@ngx-translate/core';
import {BillingStore} from '../../../application/billing.store';

@Component({
  selector: 'app-subscription-detail',
  imports: [MatCardModule, MatButtonModule, MatChipsModule, TranslatePipe, DatePipe],
  templateUrl: './subscription-detail.html',
  styleUrl: './subscription-detail.css'
})
export class SubscriptionDetail implements OnInit {
  readonly store = inject(BillingStore);
  #router = inject(Router);

  ngOnInit() {
    this.store.load();
  }

  choosePlan() {
    this.#router.navigate(['billing/plans']).then();
  }
}
