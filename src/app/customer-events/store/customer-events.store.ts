import { computed, DestroyRef, inject } from '@angular/core';
import { signalStore, withComputed, withHooks, withMethods } from '@ngrx/signals';

import { EventsHttpService } from '../services/events-http.service';
import { EventType } from '../models/customer-events.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    const addEventProperty = (eventFormGroup: any) => {
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

    const removeEventProperty = (formGroup: any, index: number) => {
      formGroup.controls.eventProperties.removeAt(index);
    };

    const removeEvent = (index: number) => {
      store.filterStepForm().controls.filterSteps.removeAt(index);
    };

    const createEventFormGroup = (initialValues?: any): FormGroup => {
      const fb = store.formBuilder();

      const group = fb.group({
        name: [
          { value: initialValues?.name ?? 'Unnamed step', disabled: true },
          Validators.required,
        ],
        eventType: [initialValues?.eventType ?? '', Validators.required],
        eventProperties: fb.array(
          (initialValues?.eventProperties ?? []).map((prop: any) =>
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
          if (
            value &&
            !store
              .events()
              .map((event) => event.type)
              .includes(value as EventType)
          ) {
            group.controls.eventProperties.clear();
          }
          group.controls.name.setValue(value ? value : 'Unnamed step');
        });

      return group;
    };

    const addEvent = () => {
      store.filterStepForm().controls.filterSteps.push(createEventFormGroup());
    };

    const copyEvent = (formGroup: FormGroup) => {
      const values = formGroup.getRawValue();
      store.filterStepForm().controls.filterSteps.push(createEventFormGroup(values));
    };

    const discardFilters = () => {
      store.filterStepForm().controls.filterSteps.clear();
      addEvent();
    };

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
    onInit: (store) => store.addEvent(),
  }),
);
