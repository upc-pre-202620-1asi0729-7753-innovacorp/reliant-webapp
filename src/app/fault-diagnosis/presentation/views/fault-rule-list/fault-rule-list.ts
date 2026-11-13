import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatError} from '@angular/material/form-field';
import {TranslatePipe} from '@ngx-translate/core';
import {FaultDiagnosisStore} from '../../../application/fault-diagnosis.store';
import {IamStore} from '../../../../iam/application/iam.store';

@Component({
  selector: 'app-fault-rule-list',
  imports: [MatTableModule, MatButtonModule, MatIconModule, MatError, TranslatePipe],
  templateUrl: './fault-rule-list.html',
  styleUrl: './fault-rule-list.css'
})
export class FaultRuleList {
  readonly store = inject(FaultDiagnosisStore);
  readonly iam = inject(IamStore);
  readonly #router = inject(Router);
  readonly displayedColumns = ['parameter', 'band', 'probableCause', 'recommendedAction', 'cooldownSeconds', 'actions'];

  constructor() {
    this.store.loadFaultRules();
  }

  newRule() {
    this.#router.navigate(['fault-diagnosis/fault-rules/new']).then();
  }

  editRule(id: number) {
    this.#router.navigate(['fault-diagnosis/fault-rules', id, 'edit']).then();
  }

  back() {
    this.#router.navigate(['fault-diagnosis/fault-cases']).then();
  }
}
