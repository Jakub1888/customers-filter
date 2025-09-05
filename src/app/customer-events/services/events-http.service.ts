import { httpResource, HttpResourceRef } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CustomerEvents } from '../models/customer-events.model';

@Injectable({ providedIn: 'root' })
export class EventsHttpService {
  private readonly apiUrl = 'https://br-fe-assignment.github.io/customer-events/events.json';

  readonly eventsResource: HttpResourceRef<CustomerEvents> = httpResource(() => this.apiUrl, {
    defaultValue: { events: [] },
  });
}
