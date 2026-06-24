import { Booking, Event, EventType, TicketType } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';

function assertOk(res: Response) {
  if (!res.ok) {
    return res.text().then((t) => {
      const msg = t || `Request failed with status ${res.status}`;
      throw new Error(msg);
    });
  }
}

export async function getEvents(): Promise<Event[]> {
  const res = await fetch(`${API_BASE_URL}/api/events`);
  await assertOk(res);
  return (await res.json()) as Event[];
}

export async function createEvent(newEvent: Omit<Event, 'id'> & { id?: string }): Promise<Event> {
  const res = await fetch(`${API_BASE_URL}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newEvent)
  });
  await assertOk(res);
  return (await res.json()) as Event;
}

export async function getBookings(): Promise<Booking[]> {
  const res = await fetch(`${API_BASE_URL}/api/bookings`);
  await assertOk(res);
  return (await res.json()) as Booking[];
}

export async function createBooking(params: {
  eventId: string;
  eventName: string;
  eventDate: string;
  ticketTypeName: 'General' | 'VIP';
  quantity: number;
  customerName: string;
  customerEmail: string;
}): Promise<Booking> {
  const res = await fetch(`${API_BASE_URL}/api/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  await assertOk(res);
  return (await res.json()) as Booking;
}

