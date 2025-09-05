import { AbstractControl, FormGroup } from '@angular/forms';

export function getFormControl(formGroup: FormGroup, selector: string): AbstractControl | null {
  return formGroup.get(selector);
}
