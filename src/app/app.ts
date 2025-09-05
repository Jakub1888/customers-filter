import { Component, inject } from '@angular/core';
import { CustomerEventsStore } from './customer-events/store/customer-events.store';
import { CustomerEventsFilter } from './customer-events/customer-events-filter/customer-events-filter';

@Component({
  selector: 'app-root',
  imports: [CustomerEventsFilter],
  providers: [CustomerEventsStore],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly store = inject(CustomerEventsStore);
}
