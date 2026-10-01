import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

export const thresholdOrderValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const v = group.value;
  const ok = v.lowerShutdown < v.lowerWarning
    && v.lowerWarning < v.nominalMin
    && v.nominalMin <= v.setpoint
    && v.setpoint <= v.nominalMax
    && v.nominalMax < v.upperWarning
    && v.upperWarning < v.upperShutdown;
  return ok ? null : {thresholdOrder: true};
};
