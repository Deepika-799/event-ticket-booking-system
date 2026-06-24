import React from 'react';
import { Calendar, MapPin, Clock, Ticket } from 'lucide-react';
import { Event } from '../types';
import { formatINR } from '../utils/formatCurrency';

interface EventCardProps {
  key?: string;
  event: Event;
  onSelect: (eventId: string) => void;
}

export default function EventCard({ event, onSelect }: EventCardProps) {
  // Find starting price
  const basePrice = Math.min(...event.ticketTypes.map((t) => t.price));

  // Count total and booked seats to determine overall state
  const totalVolume = event.ticketTypes.reduce((acc, curr) => acc + curr.totalSeats, 0);
  const totalBooked = event.ticketTypes.reduce((acc, curr) => acc + curr.bookedSeats, 0);
  const remaining = totalVolume - totalBooked;

  // Set visual elements based on event category
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'Concert':
        return { bg: 'bg-[#EFF6FF] text-[#2563EB] border-blue-100', dot: 'bg-[#2563EB]' };
      case 'Workshop':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500' };
      case 'Meetup':
        return { bg: 'bg-purple-50 text-purple-700 border-purple-100', dot: 'bg-purple-500' };
      case 'Sports':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' };
      case 'Comedy':
        return { bg: 'bg-pink-50 text-pink-700 border-pink-100', dot: 'bg-pink-500' };
      default:
        return { bg: 'bg-slate-50 text-slate-700 border-slate-100', dot: 'bg-slate-500' };
    }
  };

  const badge = getTypeStyles(event.type);

  // Remaining seats state label
  const getAvailabilityLabel = () => {
    if (remaining === 0) return { text: 'Sold Out', style: 'bg-rose-50 text-rose-700 border-rose-100' };
    if (remaining < 15) return { text: 'Limited Seats Left', style: 'bg-orange-50 text-orange-700 border-orange-100 animate-pulse' };
    return { text: `${remaining} Seats Left`, style: 'bg-slate-50 text-slate-600 border-slate-100' };
  };

  const avail = getAvailabilityLabel();

  // Format date
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div
      id={`event-card-${event.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-slate-200 hover:shadow-md cursor-pointer"
      onClick={() => onSelect(event.id)}
    >
      {/* Event Header Image with badge */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={event.imageUrl}
          alt={event.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        {/* Dynamic Type Badge */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.bg} backdrop-blur-xs`}>
            <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
            {event.type}
          </span>
          <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${avail.style}`}>
            {avail.text}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <span>By {event.organizerName}</span>
        </div>

        <h3 className="mb-2 text-lg font-bold tracking-tight text-slate-900 group-hover:text-[#2563EB] transition-colors line-clamp-1">
          {event.name}
        </h3>

        <p className="mb-4 text-sm text-slate-500 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Technical Data Layout */}
        <div className="mt-auto space-y-2 border-t border-slate-50 pt-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400 line-clamp-1" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>

        {/* Footer info: starting price & Book Button */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
          <div>
            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold">Tickets From</span>
            <span className="text-lg font-extrabold text-slate-900">{formatINR(basePrice)}</span>
          </div>
          <button
            id={`book-btn-${event.id}`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#2563EB] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-[#1D4ED8] hover:shadow-md cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(event.id);
            }}
          >
            <Ticket className="h-3.5 w-3.5" />
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
