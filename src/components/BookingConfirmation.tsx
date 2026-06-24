import React from 'react';
import { CheckCircle, Calendar, MapPin, Ticket, Mail, User, ShieldCheck, Download } from 'lucide-react';
import { Booking } from '../types';
import { formatINR } from '../utils/formatCurrency';

interface BookingConfirmationProps {
  booking: Booking;
  onClose: () => void;
}

export default function BookingConfirmation({ booking, onClose }: BookingConfirmationProps) {
  // Format date
  const formattedEventDate = new Date(booking.eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedBookingDate = new Date(booking.bookingDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div id={`booking-confirmation-${booking.id}`} className="max-w-xl mx-auto px-4 py-8">
      {/* Visual Success Accent */}
      <div className="text-center mb-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4 border border-emerald-100">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Booking Confirmed!
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Your reservation is verified. We've emailed details to {booking.customerEmail}.
        </p>
      </div>

      {/* Styled Voucher Ticket Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-250 bg-white shadow-md">
        {/* Top Header Decorator */}
        <div className="h-2 bg-gradient-to-r from-[#2563EB] to-blue-700" />

        {/* Core Voucher Contents */}
        <div className="p-6">
          <div className="flex justify-between items-start border-b border-dashed border-slate-150 pb-5 mb-5">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Unique Booking ID</span>
              <span className="text-sm font-mono font-bold text-[#2563EB] bg-blue-50/60 border border-blue-100 px-2 py-0.5 rounded-md" id="confirmation-booking-id">
                {booking.id}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Booked On</span>
              <span className="text-xs text-slate-500 font-medium">{formattedBookingDate}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Event</span>
              <h3 className="text-lg font-bold text-slate-900" id="confirmation-event-name">
                {booking.eventName}
              </h3>
            </div>

            {/* Layout details */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Date & Venue</span>
                </div>
                <p className="text-xs font-bold text-slate-800 leading-snug">
                  {formattedEventDate}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Location</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 leading-snug truncate">
                  {booking.eventDate}
                </p>
              </div>
            </div>

            {/* Attendance & Billing Details */}
            <div className="border-t border-slate-50 pt-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <User className="h-4 w-4 text-slate-400" />
                  <span>Attendee</span>
                </div>
                <span className="font-bold text-slate-800" id="confirmation-customer-name">
                  {booking.customerName}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span>Email</span>
                </div>
                <span className="font-semibold text-slate-600 truncate max-w-[200px]" id="confirmation-customer-email">
                  {booking.customerEmail}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <Ticket className="h-4 w-4 text-slate-400" />
                  <span>Tickets</span>
                </div>
                <span className="font-bold text-slate-800" id="confirmation-ticket-info">
                  {booking.quantity} x {booking.ticketTypeName} Ticket(s)
                </span>
              </div>
            </div>

            {/* Grand Total Footer */}
            <div className="border-t-2 border-slate-100/80 bg-slate-50/50 -mx-6 -mb-6 p-6 flex justify-between items-center">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Price Paid</span>
                <span className="text-xl font-extrabold text-slate-900" id="confirmation-total-amount">
                  {formatINR(booking.totalAmount)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100/50 rounded-full py-1.5 px-3">
                <ShieldCheck className="h-4 w-4" />
                <span>Authorized</span>
              </div>
            </div>
          </div>
        </div>

        {/* Voucher Cut-outs (Styling aesthetic) */}
        <div className="absolute left-0 bottom-24 -ml-2.5 h-5 w-5 rounded-full bg-slate-50 border-r border-slate-200" />
        <div className="absolute right-0 bottom-24 -mr-2.5 h-5 w-5 rounded-full bg-slate-50 border-l border-slate-200" />
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <button
          id="print-ticket-button"
          onClick={() => window.print()}
          className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
        >
          <Download className="h-4 w-4" />
          Print / Save Ticket
        </button>
        <button
          id="return-home-button"
          onClick={onClose}
          className="flex-1 rounded-xl bg-[#2563EB] px-4 py-3 text-center text-sm font-bold text-white hover:bg-[#1D4ED8] shadow-sm transition-all cursor-pointer"
        >
          Browse More Events
        </button>
      </div>
    </div>
  );
}
