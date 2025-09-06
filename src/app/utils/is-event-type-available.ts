import { CustomerEvent, EventType } from '../customer-events/models/customer-events.model';

/**
 * Checks if the specified event type is available in the list of customer events.
 *
 * @param events - Array of customer events to search through
 * @param value - The event type string to check for availability
 * @returns True if the event type exists in the events array, false otherwise
 */
export function isEventTypeAvailable(events: CustomerEvent[], value: string): boolean {
  return events.map((event) => event.type).includes(value as EventType);
}
