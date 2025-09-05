export enum EventType {
  'session_start' = 'session start',
  'session_end' = 'session end',
  'page_visit' = 'page visit',
  'purchase' = 'purchase',
  'cart_update' = 'cart update',
  'view_item' = 'view item',
}

export type CustomerEventProperty = {
  type: string;
  property: string;
};

export type CustomerEvent = {
  type: EventType;
  properties: CustomerEventProperty[];
};

export type CustomerEvents = {
  events: CustomerEvent[];
};
