import {
  Component,
  computed,
  ElementRef,
  input,
  OnInit,
  output,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CustomerEvent, CustomerEventProperty } from '../models/customer-events.model';
import { getFormControl } from '../../utils';
import { map, startWith, tap } from 'rxjs';
import { FilterInputGroup } from '../../components/filter-input-group/filter-input-group';

function indexTransform(index: number | undefined): number {
  return index ? index + 1 : 1;
}

@Component({
  selector: 'app-customer-events-filter-step',
  imports: [ReactiveFormsModule, FilterInputGroup],
  templateUrl: './customer-events-filter-step.html',
  styleUrl: './customer-events-filter-step.scss',
})
export class CustomerEventsFilterStep implements OnInit {
  readonly formGroup = input.required<FormGroup>();
  readonly events = input.required<CustomerEvent[]>();
  readonly stepIndex = input(1, { transform: indexTransform });
  readonly addEventProperty = output<FormGroup>();
  readonly removeEventProperty = output<{ formGroup: FormGroup; index: number }>();

  protected readonly nameInput = viewChild('nameInput', { read: ElementRef });
  protected readonly eventType = computed(() => getFormControl(this.formGroup(), 'eventType'));
  protected readonly name = computed(() => getFormControl(this.formGroup(), 'name'));
  protected readonly eventPropertiesArray = computed(
    () => getFormControl(this.formGroup(), 'eventProperties') as FormArray<FormGroup>,
  );
  protected readonly addEventPropertyAvailable = signal(false);
  protected eventProperties: WritableSignal<CustomerEventProperty[]> = signal([]);

  ngOnInit(): void {
    this.eventType()
      ?.valueChanges.pipe(
        startWith(this.eventType()?.value),
        tap((eventType) =>
          this.addEventPropertyAvailable.set(
            eventType &&
              this.events()
                .map((event) => event.type)
                .includes(eventType),
          ),
        ),
        map((eventType) =>
          this.events()
            ?.filter((event) => event.type === eventType)
            .flatMap((event) => event.properties),
        ),
      )
      .subscribe((eventProperties) => this.eventProperties.set(eventProperties));
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
}
