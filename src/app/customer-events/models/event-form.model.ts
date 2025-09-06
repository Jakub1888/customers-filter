import { FormArray, FormControl, FormGroup } from '@angular/forms';

export interface EventPropertyFormValue {
  type: string | null;
  property: string | null;
  value: string | null;
  operator: string | null;
}

export interface EventFormValue {
  name: string;
  eventType: string;
  eventProperties: EventPropertyFormValue[];
}

export interface EventPropertyFormGroup extends FormGroup {
  controls: {
    type: FormControl<string | null>;
    property: FormControl<string | null>;
    value: FormControl<string | null>;
    operator: FormControl<string | null>;
  };
}

export interface EventFormGroup extends FormGroup {
  controls: {
    name: FormControl<string>;
    eventType: FormControl<string>;
    eventProperties: FormArray<EventPropertyFormGroup>;
  };
}
