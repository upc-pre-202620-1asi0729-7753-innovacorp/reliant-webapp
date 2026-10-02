import {Component, inject} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';

export const ABORT_REASONS = ['FLAME_OUT', 'POWDER_DEPLETED', 'MACHINE_FAULT', 'OPERATOR_DECISION', 'OTHER'] as const;

@Component({
  selector: 'app-abort-session-dialog',
  imports: [MatDialogModule, MatButtonModule, MatFormFieldModule, MatSelectModule, MatInputModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './abort-session-dialog.html',
  styleUrl: './abort-session-dialog.css'
})
export class AbortSessionDialog {
  #fb = inject(FormBuilder);
  #ref = inject(MatDialogRef<AbortSessionDialog, string | undefined>);
  readonly reasons = ABORT_REASONS;

  form = this.#fb.group({
    reason: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    notes: new FormControl<string>('', { nonNullable: true })
  });

  confirm() {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.#ref.close(v.notes ? `${v.reason}: ${v.notes}` : v.reason);
  }

  cancel() {
    this.#ref.close(undefined);
  }
}
