import { AbstractControl, FormGroup } from '@angular/forms';

/**
 * Retrieves a form control from a FormGroup by its selector path.
 *
 * @param formGroup - The FormGroup to search in
 * @param selector - The path to the form control (e.g., 'name' or 'address.street')
 * @returns The AbstractControl if found, null otherwise
 */
export function getFormControl(formGroup: FormGroup, selector: string): AbstractControl | null {
  return formGroup.get(selector);
}
