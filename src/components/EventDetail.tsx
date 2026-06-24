import React, { useState } from 'react';
import { ChevronLeft, Calendar, Clock, MapPin, Ticket, ShieldAlert } from 'lucide-react';
import { Event, TicketType } from '../types';
import { formatINR } from '../utils/formatCurrency';

interface EventDetailProps {
  event: Event;
  onBack: () => void;
  onBook: (ticketTypeName: 'General' | 'VIP', quantity: number, customerName: string, customerEmail: string) => void;
}

export default function EventDetail({ event, onBack, onBook }: EventDetailProps) {
  const [selectedTicketType, setSelectedTicketType] = useState<'General' | 'VIP'>('General');
  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Find active ticket type data
  const ticketTypeData = event.ticketTypes.find((t) => t.name === selectedTicketType);
  const availableSeats = ticketTypeData ? ticketTypeData.totalSeats - ticketTypeData.bookedSeats : 0;

  // Simple check if the event date is set in the past relative to current date '2026-06-09'
  const today = new Date('2026-06-09');
  const eventDateParsed = new Date(event.date);
  const isPastEvent = eventDateParsed < today;

  // Format date
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'Concert': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Workshop': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Meetup': return 'bg-purple-50 text-purple-700 border-purple-100';
      case 'Sports': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Comedy': return 'bg-pink-50 text-pink-700 border-pink-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isPastEvent) {
      setError('Tickets are unavailable because this event has already concluded.');
      return;
    }

    // Form inputs and edge case guards
    if (!customerName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!customerEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      setError('Please enter a valid email address (e.g., name@domain.com).');
      return;
    }

    if (quantity <= 0) {
      setError('Please select a ticket quantity of at least 1 ticket.');
      return;
    }

    if (!Number.isInteger(quantity)) {
      setError('Ticket quantity must be a whole number.');
      return;
    }

    if (quantity > availableSeats) {
      if (availableSeats === 0) {
        setError(`This ticket type is sold out.`);
      } else {
        setError(`Only ${availableSeats} tickets are remaining of this category.`);
      }
      return;
    }

    // Success -> fire booking flow
    onBook(selectedTicketType, quantity, customerName, customerEmail);
  };

  // Helper to calculate pricing
  const currentPrice = ticketTypeData ? ticketTypeData.price : 0;
  const totalPrice = currentPrice * quantity;

  return (
    <div id={`event-detail-${event.id}`} className="max-w-4xl mx-auto px-4 py-6">
      {/* Back button */}
      <button
        id="detail-back-button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-[#2563EB] transition-colors group cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Event Catalog
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Event details */}
        <div className="md:col-span-7 space-y-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            {/* Visual Header Banner */}
            <div className="relative h-64 w-full bg-slate-100">
              <img
                src={event.imageUrl}
                alt={event.name}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className={`absolute top-4 left-4 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getBadgeColor(event.type)} backdrop-blur-xs`}>
                {event.type}
              </span>
            </div>

            {/* Core Info */}
            <div className="p-6">
              <div className="mb-2 text-xs font-semibold text-slate-400">
                Organized by <span className="text-slate-700">{event.organizerName}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mb-4">
                {event.name}
              </h1>

              {/* Description */}
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-2 border-b border-slate-100 pb-2">
                About the Event
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {event.description}
              </p>

              {/* Event Metadata Cards */}
              <div className="grid grid-cols-1 gap-3.5 border-t border-slate-50 pt-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-50 p-2 text-[#2563EB] mt-0.5 animate-pulse">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Date</span>
                    <span className="text-slate-800 text-sm font-semibold">{formattedDate}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-50 p-2 text-[#2563EB] mt-0.5">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Doors Open</span>
                    <span className="text-slate-800 text-sm font-semibold">{event.time} Local Time</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-blue-50 p-2 text-[#2563EB] mt-0.5">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-400">Venue</span>
                    <span className="text-slate-800 text-sm font-semibold">{event.venue}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Ticket select & Booking form */}
        <div className="md:col-span-5">
          <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold tracking-tight text-slate-900 mb-4">
              Select Tickets & Book
            </h2>

            {/* Error alerts */}
            {isPastEvent && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs text-amber-700 font-medium">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Ticketing Closed: This event was held in the past. New bookings and changes are locked.</span>
              </div>
            )}

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-100 bg-rose-50 p-3 text-xs text-rose-700">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {/* Ticket Type Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Ticket Tier
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {event.ticketTypes.map((t) => {
                    const seatsLeft = t.totalSeats - t.bookedSeats;
                    const isSoldOut = seatsLeft <= 0;
                    const isSelected = selectedTicketType === t.name;

                    return (
                      <button
                        key={t.name}
                        id={`ticket-tier-${t.name}`}
                        type="button"
                        onClick={() => {
                          setSelectedTicketType(t.name);
                          setError('');
                        }}
                        className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all relative ${
                          isSelected
                            ? 'border-[#2563EB] bg-[#EFF6FF] ring-1 ring-[#2563EB]'
                            : 'border-slate-200 hover:border-slate-350 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-sm font-bold text-slate-900">{t.name}</span>
                          <span className="text-sm font-extrabold text-[#2563EB]">{formatINR(t.price)}</span>
                        </div>
                        {isSoldOut ? (
                          <span className="text-[10px] bg-rose-50 text-rose-600 border border-rose-100 rounded-sm px-1.5 py-0.5 font-bold">
                            Sold Out
                          </span>
                        ) : (
                          <span className={`text-[10px] font-semibold ${seatsLeft < 10 ? 'text-orange-600' : 'text-slate-500'}`}>
                            {seatsLeft} left
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Picker */}
              <div>
                <label htmlFor="booking-quantity" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50/50 p-1">
                    <button
                      id="quantity-minus"
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-600 shadow-2xs hover:bg-slate-50 disabled:opacity-50 font-bold"
                    >
                      -
                    </button>
                    <span id="quantity-display" className="w-12 text-center text-sm font-bold text-slate-800">
                      {quantity}
                    </span>
                    <button
                      id="quantity-plus"
                      type="button"
                      disabled={quantity >= availableSeats}
                      onClick={() => setQuantity((prev) => Math.min(availableSeats, prev + 1))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-600 shadow-2xs hover:bg-slate-50 disabled:opacity-50 font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    (Max: {availableSeats || 0})
                  </span>
                </div>
              </div>

              {/* Your Name & Email with sleek borders */}
              <div className="space-y-3.5 border-t border-slate-100 pt-4">
                <div>
                  <label htmlFor="customer-name" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Your Full Name
                  </label>
                  <input
                    id="customer-name"
                    type="text"
                    required
                    disabled={isPastEvent}
                    placeholder={isPastEvent ? "Booking closed" : "Jane Doe"}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm placeholder-slate-400 focus:border-[#2563EB] focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>

                <div>
                  <label htmlFor="customer-email" className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Email Address
                  </label>
                  <input
                    id="customer-email"
                    type="email"
                    required
                    disabled={isPastEvent}
                    placeholder={isPastEvent ? "Booking closed" : "jane.doe@example.com"}
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm placeholder-slate-400 focus:border-[#2563EB] focus:outline-hidden disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-150 space-y-1.5 text-xs">
                <div className="flex justify-between font-medium text-slate-500">
                  <span>{quantity} x {selectedTicketType} Ticket</span>
                  <span>{formatINR(currentPrice)} ea</span>
                </div>
                <div className="flex justify-between border-t border-slate-200/60 pt-2 font-bold text-slate-800 text-sm">
                  <span>Total Due</span>
                  <span className="text-[#2563EB] text-base font-extrabold" id="total-price-preview">
                    {formatINR(totalPrice)}
                  </span>
                </div>
              </div>

              {/* Booking Action Buttons */}
              {isPastEvent ? (
                <button
                  id="submit-booking-past"
                  type="button"
                  disabled
                  className="w-full rounded-xl bg-slate-150 py-3 text-center text-sm font-bold text-slate-400 cursor-not-allowed border border-slate-250"
                >
                  Booking Closed (Past Event)
                </button>
              ) : availableSeats === 0 ? (
                <button
                  id="submit-booking-sold-out"
                  type="button"
                  disabled
                  className="w-full rounded-xl bg-slate-200 py-3 text-center text-sm font-bold text-slate-500 cursor-not-allowed border border-slate-100"
                >
                  Sold Out
                </button>
              ) : (
                <button
                  id="submit-booking-button"
                  type="submit"
                  className="w-full rounded-xl bg-[#2563EB] py-3 text-center text-sm font-bold text-white shadow-xs transition-all hover:bg-[#1D4ED8] hover:shadow-md cursor-pointer"
                >
                  Confirm Booking ({formatINR(totalPrice)})
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
