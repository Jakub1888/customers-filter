import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { getFormControl } from '../../utils';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-filter-input-group',
  imports: [ReactiveFormsModule],
  templateUrl: './filter-input-group.html',
  styleUrl: './filter-input-group.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterInputGroup<T extends { property: string; type: string }> {
  readonly formGroup = input.required<FormGroup>();
  readonly properties = input.required<T[] | null>();
  readonly index = input.required<number>();
  readonly removeEventProperty = output<void>();

  protected readonly property = computed(() => getFormControl(this.formGroup(), 'property'));
  protected readonly categories: Record<string, string[]> = {
    ['string']: ['equals', 'does not equal', 'contains', 'does not contain'],
    ['number']: ['equal to', 'in between', 'less than', 'greater than'],
  };
  protected readonly selectedType = signal<string>('string');

  constructor() {
    effect(() => {
      this.property()
        ?.valueChanges.pipe(startWith(this.formGroup().controls))
        .subscribe((propertyValue: string) => this.updateFormForProperty(propertyValue));
    });
  }

  protected onRemoveEventProperty() {
    this.removeEventProperty.emit();
  }

  private updateFormForProperty(propertyValue: string): void {
    const type = this.properties()?.find((value) => value.property === propertyValue)?.type;
    if (type) {
      this.selectedType.set(type);
      this.formGroup().controls['type'].setValue(type);
    }
    this.formGroup().controls['operator'].setValue(this.categories[this.selectedType()][0]);
  }
}
