import express from 'express';

import { readStore, writeStore } from './dataStore.ts';
import type { Booking, Event } from '../src/types.ts';

const app = express();


// Simple local-dev CORS (no extra dependency)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());


app.get('/api/events', (_req, res) => {
  const { events } = readStore();
  res.json(events);
});

app.post('/api/events', (req, res) => {
  const body = req.body as Omit<Event, 'id'> & { id?: string };
  if (!body || !body.name || !body.date || !body.time || !body.venue || !body.description || !body.type || !body.ticketTypes || !body.organizerName) {
    return res.status(400).send('Invalid event payload');
  }

  const store = readStore();
  const nextId = body.id ?? `evt-${Date.now()}`;

  const nextEvent: Event = {
    id: nextId,
    ...body,
    ticketTypes: body.ticketTypes.map((t) => ({
      ...t,
      bookedSeats: Number.isFinite(t.bookedSeats) ? t.bookedSeats : 0,
      totalSeats: Number(t.totalSeats),
      price: Number(t.price)
    }))
  };

  store.events = [nextEvent, ...store.events];
  writeStore(store);
  res.status(201).json(nextEvent);
});

app.get('/api/bookings', (_req, res) => {
  const { bookings } = readStore();
  res.json(bookings);
});

app.post('/api/bookings', (req, res) => {
  const body = req.body as {
    eventId: string;
    eventName: string;
    eventDate: string;
    ticketTypeName: 'General' | 'VIP';
    quantity: number;
    customerName: string;
    customerEmail: string;
  };

  if (!body?.eventId || !body?.ticketTypeName || !body?.customerName || !body?.customerEmail || !Number.isFinite(body?.quantity)) {
    return res.status(400).send('Invalid booking payload');
  }

  const quantity = Math.floor(body.quantity);
  if (quantity <= 0) return res.status(400).send('Quantity must be > 0');

  const store = readStore();
  const evt = store.events.find((e) => e.id === body.eventId);
  if (!evt) return res.status(404).send('Event not found');

  const tier = evt.ticketTypes.find((t) => t.name === body.ticketTypeName);
  if (!tier) return res.status(404).send('Ticket type not found');

  const availableSeats = tier.totalSeats - tier.bookedSeats;
  if (quantity > availableSeats) {
    return res.status(409).send(`Not enough seats. Only ${availableSeats} left.`);
  }

  // enforce capacity by updating bookedSeats
  tier.bookedSeats += quantity;

  const booking: Booking = {
    id: `BK-${Math.floor(10000 + Math.random() * 90000)}`,
    eventId: evt.id,
    eventName: evt.name,
    eventDate: evt.date,
    ticketTypeName: tier.name,
    quantity,
    totalAmount: tier.price * quantity,
    customerName: body.customerName,
    customerEmail: body.customerEmail,
    bookingDate: new Date().toISOString()
  };

  store.bookings = [booking, ...store.bookings];
  writeStore(store);

  res.status(201).json(booking);
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`TicketFlow backend listening on http://localhost:${PORT}`);
});

