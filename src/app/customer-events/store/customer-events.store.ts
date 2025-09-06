import { computed, DestroyRef, inject } from '@angular/core';
import { signalStore, withComputed, withHooks, withMethods } from '@ngrx/signals';

import { EventsHttpService } from '../services/events-http.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { isEventTypeAvailable } from '../../utils';
import { EventFormGroup, EventFormValue, EventPropertyFormValue } from '../models';

export const CustomerEventsStore = signalStore(
  withComputed((store, eventsService = inject(EventsHttpService)) => {
    const events = computed(() => eventsService.eventsResource.value()?.events);
    const formBuilder = computed(() => new FormBuilder());

    const filterStepForm = computed(() =>
      formBuilder().group({
        filterSteps: formBuilder().array<FormGroup>([]),
      }),
    );

    return { events, formBuilder, filterStepForm };
  }),

  withMethods((store, destroyRef = inject(DestroyRef)) => {
    /**
     * Adds a new empty event form group to the filter steps array.
     */
    const addEvent = () => {
      store.filterStepForm().controls.filterSteps.push(createEventFormGroup());
    };

    /**
     * Creates a copy of an existing event form group with the same values and adds it to the filter steps array.
     *
     * @param formGroup - The source form group to copy values from
     */
    const copyEvent = (formGroup: FormGroup) => {
      const values = formGroup.getRawValue();
      store.filterStepForm().controls.filterSteps.push(createEventFormGroup(values));
    };

    /**
     * Removes a filter step form control at the specified index from the main filter form.
     *
     * @param index - The index of the filter step to remove
     */
    const removeEvent = (index: number) => {
      store.filterStepForm().controls.filterSteps.removeAt(index);
    };

    /**
     * Adds a new event property form group to the specified event form group.
     * Creates a form group with required validators for type, property, value, and operator fields.
     *
     * @param eventFormGroup - The event form group to add the property to
     */
    const addEventProperty = (eventFormGroup: EventFormGroup) => {
      eventFormGroup.controls.eventProperties.push(
        store.formBuilder().group({
          type: [null, Validators.required],
          property: [null, Validators.required],
          value: [null, Validators.required],
          operator: [null, Validators.required],
        }),
      );
      eventFormGroup.controls.eventProperties.updateValueAndValidity();
    };

    /**
     * Removes an event property form control at the specified index from the form group.
     *
     * @param formGroup - The form group containing the event properties array
     * @param index - The index of the event property to remove
     */
    const removeEventProperty = (formGroup: EventFormGroup, index: number) => {
      formGroup.controls.eventProperties.removeAt(index);
    };

    /**
     * Creates a new event form group with optional initial values.
     * Sets up form controls for name, eventType, and eventProperties with appropriate validators.
     * Automatically manages event type changes and clears properties when event type becomes invalid.
     *
     * @param initialValues - Optional initial values to populate the form group
     * @returns A configured FormGroup for event filtering
     */
    const createEventFormGroup = (initialValues?: Partial<EventFormValue>): FormGroup => {
      const fb = store.formBuilder();
      const group = fb.group({
        name: [
          { value: initialValues?.name ?? 'Unnamed step', disabled: true },
          Validators.required,
        ],
        eventType: [initialValues?.eventType ?? '', Validators.required],
        eventProperties: fb.array(
          (initialValues?.eventProperties ?? []).map((prop: EventPropertyFormValue) =>
            fb.group({
              type: [prop.type, Validators.required],
              property: [prop.property, Validators.required],
              value: [prop.value, Validators.required],
              operator: [prop.operator, Validators.required],
            }),
          ),
        ),
      });

      group.controls.eventType.valueChanges
        .pipe(takeUntilDestroyed(destroyRef))
        .subscribe((value) => {
          if (value && isEventTypeAvailable(store.events(), value)) {
            group.controls.eventProperties.clear();
          }
          group.controls.name.setValue(value ? value : 'Unnamed step');
        });

      return group;
    };

    /**
     * Clears all existing filter steps and adds a single empty event form group.
     * Used to reset the filter form to its initial state.
     */
    const discardFilters = () => {
      store.filterStepForm().controls.filterSteps.clear();
      addEvent();
    };

    /**
     * Applies the current filter configuration by logging the form values.
     * TODO: Replace console.log with actual filter application logic.
     */
    const applyFilters = () => {
      console.log(store.filterStepForm().getRawValue());
    };

    return {
      addEvent,
      addEventProperty,
      applyFilters,
      copyEvent,
      discardFilters,
      removeEvent,
      removeEventProperty,
    };
  }),

  withHooks({
    // Initialize form with first event
    onInit: (store) => store.addEvent(),
  }),
);
