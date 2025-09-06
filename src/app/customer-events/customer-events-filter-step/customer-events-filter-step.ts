import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CustomerEvent, CustomerEventProperty } from '../models/customer-events.model';
import { getFormControl, isEventTypeAvailable } from '../../utils';
import { startWith } from 'rxjs';
import { FilterInputGroup } from '../../components/filter-input-group/filter-input-group';
import { EventFormGroup } from '../models';

function indexTransform(index: number | undefined): number {
  return index ? index + 1 : 1;
}

@Component({
  selector: 'app-customer-events-filter-step',
  imports: [ReactiveFormsModule, FilterInputGroup],
  templateUrl: './customer-events-filter-step.html',
  styleUrl: './customer-events-filter-step.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerEventsFilterStep {
  private readonly destroyRef = inject(DestroyRef);
  readonly formGroup = input.required<EventFormGroup>();
  readonly events = input.required<CustomerEvent[]>();
  readonly stepIndex = input(1, { transform: indexTransform });
  readonly addEventProperty = output<EventFormGroup>();
  readonly removeEventProperty = output<{ formGroup: EventFormGroup; index: number }>();

  protected readonly nameInput = viewChild('nameInput', { read: ElementRef });
  protected readonly eventType = computed(() => getFormControl(this.formGroup(), 'eventType'));
  protected readonly name = computed(() => getFormControl(this.formGroup(), 'name'));
  protected readonly eventPropertiesArray = computed(
    () => getFormControl(this.formGroup(), 'eventProperties') as FormArray<EventFormGroup>,
  );
  protected readonly addEventPropertyAvailable = signal(false);
  protected eventProperties: WritableSignal<CustomerEventProperty[]> = signal([]);

  constructor() {
    effect(() => {
      this.eventType()
        ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef), startWith(this.eventType()?.value))
        .subscribe((eventType) => this.updateEventPropertiesForType(eventType));
    });
  }

  protected onAddEventProperty(): void {
    this.addEventProperty.emit(this.formGroup());
  }

  protected onRemoveEventProperty(index: number): void {
    this.removeEventProperty.emit({ formGroup: this.formGroup(), index });
  }

  protected editName(): void {
    this.name()?.enable();
    this.nameInput()?.nativeElement.focus();
  }

  protected onNameInputBlur(): void {
    this.name()?.disable();
  }

  private updateEventPropertiesForType(eventType: string | null): void {
    const eventProperties =
      this.events()
        ?.filter((event) => event.type === eventType)
        .flatMap((event) => event.properties) ?? [];

    this.addEventPropertyAvailable.set(
      !!eventType && isEventTypeAvailable(this.events(), eventType),
    );
    this.eventProperties.set(eventProperties);
  }
}
