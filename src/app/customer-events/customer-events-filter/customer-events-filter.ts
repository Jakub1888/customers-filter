import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';

import { CustomerEventsStore } from '../store/customer-events.store';
import { CustomerEventsFilterStep } from '../customer-events-filter-step/customer-events-filter-step';

@Component({
  selector: 'app-customer-events-filter',
  imports: [ReactiveFormsModule, UpperCasePipe, CustomerEventsFilterStep],
  templateUrl: './customer-events-filter.html',
  styleUrl: './customer-events-filter.scss',
})
export class CustomerEventsFilter {
  protected readonly store = inject(CustomerEventsStore);
}
