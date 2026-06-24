export interface TicketType {
  name: 'General' | 'VIP';
  price: number;
  totalSeats: number;
  bookedSeats: number;
}

export type EventType = 'Concert' | 'Workshop' | 'Meetup' | 'Sports' | 'Comedy';

export interface Event {
  id: string;
  name: string;
  date: string; // e.g. "2026-07-15"
  time: string; // e.g. "19:00"
  venue: string;
  description: string;
  type: EventType;
  ticketTypes: TicketType[];
  organizerName: string;
  imageUrl?: string;
}

export interface Booking {
  id: string; // unique booking ID e.g. BK-10293
  eventId: string;
  eventName: string;
  eventDate: string;
  ticketTypeName: 'General' | 'VIP';
  quantity: number;
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  bookingDate: string;
}
