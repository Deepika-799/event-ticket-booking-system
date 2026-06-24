import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Plus,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  Search,
  Filter,
  CheckCircle,
  FolderOpen
} from 'lucide-react';
import { Event, Booking, EventType } from '../types';
import { formatINR } from '../utils/formatCurrency';

interface OrganizerDashboardProps {
  events: Event[];
  bookings: Booking[];
  onAddEvent: (newEvent: Omit<Event, 'id'>) => void;
}

export default function OrganizerDashboard({ events, bookings, onAddEvent }: OrganizerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'metrics' | 'create' | 'bookings'>('metrics');
  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Custom event creation state
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventVenue, setEventVenue] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventType, setEventType] = useState<EventType>('Concert');
  const [eventOrganizer, setEventOrganizer] = useState('');
  const [eventImageUrl, setEventImageUrl] = useState('');
  
  // Ticketing seat caps and values
  const [generalPrice, setGeneralPrice] = useState('30');
  const [generalSeats, setGeneralSeats] = useState('100');
  const [vipPrice, setVipPrice] = useState('80');
  const [vipSeats, setVipSeats] = useState('20');
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');

  // 1. Calculate General High-Level Stats
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalTicketsSold = bookings.reduce((sum, b) => sum + b.quantity, 0);
  
  const totalCapacity = events.reduce((sum, e) => {
    return sum + e.ticketTypes.reduce((s, t) => s + t.totalSeats, 0);
  }, 0);
  
  const totalBookedSeats = events.reduce((sum, e) => {
    return sum + e.ticketTypes.reduce((s, t) => s + t.bookedSeats, 0);
  }, 0);
  
  const overallUtilization = totalCapacity > 0 ? (totalBookedSeats / totalCapacity) * 100 : 0;

  // Selected event data
  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  // Specific Event Analytics
  const getEventStats = (evt: Event) => {
    const eventBookings = bookings.filter((b) => b.eventId === evt.id);
    const rev = eventBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const seats = eventBookings.reduce((sum, b) => sum + b.quantity, 0);
    
    const genCap = evt.ticketTypes.find((t) => t.name === 'General');
    const vipCap = evt.ticketTypes.find((t) => t.name === 'VIP');
    
    return {
      revenue: rev,
      ticketsSold: seats,
      generalBooked: genCap?.bookedSeats || 0,
      generalTotal: genCap?.totalSeats || 0,
      vipBooked: vipCap?.bookedSeats || 0,
      vipTotal: vipCap?.totalSeats || 0,
      bookingsList: eventBookings
    };
  };

  const selectedEventStats = selectedEvent ? getEventStats(selectedEvent) : null;

  const handleEventImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setEventImageFile(file);

    if (!file) {
      setEventImageUrl('');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEventImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handling manual event submission
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!eventName.trim() || !eventDate || !eventTime || !eventVenue.trim() || !eventDescription.trim() || !eventOrganizer.trim()) {
      setFormError('All fields are strictly required.');
      return;
    }

    const gPrice = parseFloat(generalPrice);
    const gSeats = parseInt(generalSeats);
    const vPrice = parseFloat(vipPrice);
    const vSeats = parseInt(vipSeats);

    if (isNaN(gPrice) || gPrice < 0 || isNaN(gSeats) || gSeats <= 0) {
      setFormError('Please enter valid, positive numbers for General admission pricing and seats.');
      return;
    }

    if (isNaN(vPrice) || vPrice < 0 || isNaN(vSeats) || vSeats <= 0) {
      setFormError('Please enter valid, positive numbers for VIP pricing and seats.');
      return;
    }

    // Default high-quality fallback Unsplash categories
    const categoryImages: Record<EventType, string> = {
      Concert: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&auto=format&fit=crop&q=60',
      Workshop: 'https://images.unsplash.com/photo-1541462608141-ad4979e408c9?w=800&auto=format&fit=crop&q=60',
      Meetup: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=60',
      Sports: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=60',
      Comedy: 'https://images.unsplash.com/photo-1585699324551-f6c309eed262?w=800&auto=format&fit=crop&q=60'
    };

    const eventImage = eventImageUrl || categoryImages[eventType];

    onAddEvent({
      name: eventName,
      date: eventDate,
      time: eventTime,
      venue: eventVenue,
      description: eventDescription,
      type: eventType,
      organizerName: eventOrganizer,
      ticketTypes: [
        { name: 'General', price: gPrice, totalSeats: gSeats, bookedSeats: 0 },
        { name: 'VIP', price: vPrice, totalSeats: vSeats, bookedSeats: 0 }
      ],
      imageUrl: eventImage
    });

    setSuccessMessage(`Successfully created event "${eventName}"!`);
    
    // Clear inputs
    setEventName('');
    setEventDate('');
    setEventTime('');
    setEventVenue('');
    setEventDescription('');
    setEventOrganizer('');
    setEventImageUrl('');
    setGeneralPrice('30');
    setGeneralSeats('100');
    setVipPrice('80');
    setVipSeats('20');
    
    // Auto focus back to metrics after brief delay
    setTimeout(() => {
      setActiveTab('metrics');
      setSuccessMessage('');
    }, 1500);
  };

  // Searching bookings across all events
  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.customerName.toLowerCase().includes(q) ||
      b.customerEmail.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.eventName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6" id="organizer-dashboard-view">
      {/* Page Title & Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Organizer Sales Console</h1>
          <p className="text-sm text-slate-500 font-medium">Real-time attendance capacity tracking, revenue mapping, & event creators.</p>
        </div>

        {/* Dashboard Tab Toggles */}
        <div className="flex bg-slate-50 border border-slate-150 p-1 rounded-xl w-fit self-start md:self-auto">
          <button
            id="tab-btn-metrics"
            onClick={() => setActiveTab('metrics')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'metrics'
                ? 'bg-white text-[#2563EB] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sales Overview
          </button>
          <button
            id="tab-btn-create"
            onClick={() => setActiveTab('create')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'create'
                ? 'bg-white text-[#2563EB] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Create New Event
          </button>
          <button
            id="tab-btn-bookings"
            onClick={() => setActiveTab('bookings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'bookings'
                ? 'bg-white text-[#2563EB] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Bookings ({bookings.length})
          </button>
        </div>
      </div>

      {/* Main Container */}
      {activeTab === 'metrics' && (
        <div className="space-y-6">
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Total Revenue</span>
                  <span className="text-2xl font-black text-slate-900" id="dash-total-revenue">{formatINR(totalRevenue)}</span>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] text-slate-500 font-semibold">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <span className="text-emerald-600">Live Ticketing Sales</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Tickets Reserved</span>
                  <span className="text-2xl font-black text-slate-900" id="dash-total-tickets">{totalTicketsSold}</span>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 text-[#2563EB]">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-[11px] text-slate-500 font-semibold">
                Across <span className="font-bold text-slate-700">{events.length}</span> active events
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Capacity Utilized</span>
                  <span className="text-2xl font-black text-slate-900" id="dash-utilization">{overallUtilization.toFixed(1)}%</span>
                </div>
                <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
              </div>
              {/* Graphical mini Bar */}
              <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full rounded-full bg-purple-600 transition-all duration-500" style={{ width: `${Math.min(100, overallUtilization)}%` }} />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Hosting Catalog</span>
                  <span className="text-2xl font-black text-slate-900" id="dash-events-count">{events.length}</span>
                </div>
                <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-[11px] text-slate-500 font-semibold">
                Available categories: <span className="font-bold text-slate-700">5</span>
              </div>
            </div>
          </div>

          {/* Drill-down Section for Specific Events */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Event List side-bar */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs flex flex-col max-h-[500px]">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Select Event to Audit</h3>
              <div className="space-y-2 overflow-y-auto pr-1 flex-1">
                {events.map((e) => {
                  const isActive = selectedEventId === e.id;
                  const itemStats = getEventStats(e);

                  return (
                    <button
                      key={e.id}
                      id={`dash-select-${e.id}`}
                      onClick={() => setSelectedEventId(e.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                        isActive
                          ? 'border-[#2563EB] bg-blue-50/20 shadow-xs'
                          : 'border-slate-50 hover:border-slate-150 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <span className="block text-sm font-bold text-slate-900 truncate">{e.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{e.date} • {e.type}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block text-xs font-extrabold text-slate-800">{formatINR(itemStats.revenue)}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{itemStats.ticketsSold} sold</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Audit Panel */}
            <div className="lg:col-span-8 space-y-6">
              {selectedEvent ? (
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-6">
                  {/* Selected Event Details Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-50 pb-5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] bg-[#EFF6FF] border border-blue-100/50 px-2 py-0.5 rounded-sm">
                        {selectedEvent.type}
                      </span>
                      <h2 className="text-xl font-black text-slate-900 mt-1" id="dash-selected-event-title">
                        {selectedEvent.name}
                      </h2>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{selectedEvent.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{selectedEvent.time}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{selectedEvent.venue}</span>
                      </div>
                    </div>
                  </div>

                  {/* Seating Type Progress Bars */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3.5">Tier Allocations & Vacancy</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* General Seating progress */}
                      <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/40">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-xs font-bold text-slate-800">General Ticketing</span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">{formatINR(selectedEvent.ticketTypes[0].price)} per seat</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-sm font-extrabold text-slate-800">
                              {selectedEventStats?.generalBooked} / {selectedEventStats?.generalTotal}
                            </span>
                            <span className="text-[10px] text-slate-400">Seats Booked</span>
                          </div>
                        </div>
                        {/* Progress slider */}
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-[#2563EB] rounded-full transition-all duration-300"
                            style={{
                              width: `${((selectedEventStats?.generalBooked || 0) / (selectedEventStats?.generalTotal || 1)) * 100}%`
                            }}
                          />
                        </div>
                        <div className="mt-2 text-right">
                          <span className="text-[10px] font-bold text-[#2563EB]">
                            {(selectedEventStats?.generalTotal || 0) - (selectedEventStats?.generalBooked || 0)} Seats Free
                          </span>
                        </div>
                      </div>

                      {/* VIP Seating progress */}
                      <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/40">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="text-xs font-bold text-slate-800">VIP Ticket Tier</span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">{formatINR(selectedEvent.ticketTypes[1].price)} per seat</span>
                          </div>
                          <div className="text-right">
                            <span className="block text-sm font-extrabold text-slate-800">
                              {selectedEventStats?.vipBooked} / {selectedEventStats?.vipTotal}
                            </span>
                            <span className="text-[10px] text-slate-400">Seats Booked</span>
                          </div>
                        </div>
                        {/* Progress slider */}
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all duration-300"
                            style={{
                              width: `${((selectedEventStats?.vipBooked || 0) / (selectedEventStats?.vipTotal || 1)) * 100}%`
                            }}
                          />
                        </div>
                        <div className="mt-2 text-right">
                          <span className="text-[10px] font-bold text-amber-600">
                            {(selectedEventStats?.vipTotal || 0) - (selectedEventStats?.vipBooked || 0)} Seats Free
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking list for this specific event */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 border-b border-slate-50 pb-2">
                      Bookings Register ({selectedEventStats?.bookingsList.length || 0})
                    </h3>

                    {selectedEventStats?.bookingsList && selectedEventStats.bookingsList.length > 0 ? (
                      <div className="overflow-x-auto rounded-xl border border-slate-150">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead className="bg-slate-50 border-b border-slate-150 font-bold text-slate-500 uppercase tracking-wider">
                            <tr>
                              <th className="p-3.5">ID / Date</th>
                              <th className="p-3.5">Attendee</th>
                              <th className="p-3.5 text-center">Tier</th>
                              <th className="p-3.5 text-center">Qty</th>
                              <th className="p-3.5 text-right">Total Price</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-600 font-medium">
                            {selectedEventStats.bookingsList.map((bk) => (
                              <tr key={bk.id} className="hover:bg-slate-50/50">
                                <td className="p-3.5">
                                  <span className="block font-mono font-bold text-slate-900">{bk.id}</span>
                                  <span className="text-[9px] text-slate-400 font-semibold">{bk.bookingDate.split('T')[0]}</span>
                                </td>
                                <td className="p-3.5">
                                  <span className="block font-bold text-slate-800">{bk.customerName}</span>
                                  <span className="text-[10px] text-slate-400 font-medium">{bk.customerEmail}</span>
                                </td>
                                <td className="p-3.5 text-center">
                                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                    bk.ticketTypeName === 'VIP'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                      : 'bg-slate-50 text-slate-600 border border-slate-100'
                                  }`}>
                                    {bk.ticketTypeName}
                                  </span>
                                </td>
                                <td className="p-3.5 text-center font-bold text-slate-800">{bk.quantity}</td>
                                <td className="p-3.5 text-right font-extrabold text-slate-900">{formatINR(bk.totalAmount)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-slate-200">
                        <FolderOpen className="h-8 w-8 text-slate-300 mb-2" />
                        <span className="text-xs text-slate-500 font-semibold">No tickets booked for this event yet.</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-slate-100">
                  <FolderOpen className="h-10 w-10 text-slate-300 mb-2" />
                  <span className="text-sm text-slate-400 font-bold">Please select an event from the listing sidebar.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Creating New Event Tab */}
      {activeTab === 'create' && (
        <div className="max-w-xl mx-auto rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-50 pb-4">
            <h2 className="text-lg font-black text-slate-900">Add New Event</h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">Specify seat caps, customizable target pricing and logistics.</p>
          </div>

          {formError && (
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-3.5 text-xs text-rose-700 font-medium flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3.5 text-xs text-emerald-700 font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Event Name
                </label>
                <input
                  id="form-event-name"
                  type="text"
                  placeholder="e.g. Symphony of Legends Live"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full rounded-lg border border-slate-100 px-3.5 py-2 text-sm placeholder-slate-400 focus:border-[#2563EB] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Category Type
                </label>
                <select
                  id="form-event-type"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as EventType)}
                  className="w-full rounded-lg border border-slate-100 px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-hidden font-medium text-slate-800"
                >
                  <option value="Concert">Concert</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Meetup">Meetup</option>
                  <option value="Sports">Sports</option>
                  <option value="Comedy">Comedy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Organizer Name
                </label>
                <input
                  id="form-event-organizer"
                  type="text"
                  placeholder="e.g. Sonic Arena Group"
                  value={eventOrganizer}
                  onChange={(e) => setEventOrganizer(e.target.value)}
                  className="w-full rounded-lg border border-slate-100 px-3.5 py-2 text-sm placeholder-slate-400 focus:border-[#2563EB] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Date
                </label>
                <input
                  id="form-event-date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-100 px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-hidden text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Time
                </label>
                <input
                  id="form-event-time"
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full rounded-lg border border-slate-100 px-3 py-2 text-sm focus:border-[#2563EB] focus:outline-hidden text-slate-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Venue Name / Location
                </label>
                <input
                  id="form-event-venue"
                  type="text"
                  placeholder="e.g. Royal Arts Center, New York"
                  value={eventVenue}
                  onChange={(e) => setEventVenue(e.target.value)}
                  className="w-full rounded-lg border border-slate-100 px-3.5 py-2 text-sm placeholder-slate-400 focus:border-[#2563EB] focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Event Image
                </label>
                <input
                  id="form-event-image"
                  type="file"
                  accept="image/*"
                  onChange={handleEventImageChange}
                  className="w-full rounded-lg border border-slate-100 px-3.5 py-2 text-sm text-slate-900 file:mr-4 file:rounded-full file:border-0 file:bg-[#2563EB] file:px-3 file:py-2 file:text-white file:font-bold focus:outline-none"
                />
                {eventImageUrl ? (
                  <img
                    src={eventImageUrl}
                    alt="Event preview"
                    className="mt-3 h-40 w-full rounded-3xl object-cover border border-slate-200"
                  />
                ) : null}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  id="form-event-desc"
                  rows={3}
                  placeholder="Brief summary describing key attraction and features..."
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-100 px-3.5 py-2 text-sm placeholder-slate-400 focus:border-[#2563EB] focus:outline-hidden resize-none"
                />
              </div>
            </div>

            {/* SEAT CAPACITIES & PRICING SUB GRID */}
            <div className="border-t border-slate-100 pt-4 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Pricing & Seat Capacities</h3>

              <div className="grid grid-cols-2 gap-4">
                {/* General seating config */}
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/30 space-y-2">
                  <span className="block text-xs font-bold text-slate-800">General Tier</span>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase">Price (₹)</label>
                    <input
                      id="form-general-price"
                      type="number"
                      min="0"
                      value={generalPrice}
                      onChange={(e) => setGeneralPrice(e.target.value)}
                      className="w-full rounded-md border border-slate-150 bg-white px-2.5 py-1 text-xs focus:border-[#2563EB] focus:outline-hidden font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase">Seats Cap</label>
                    <input
                      id="form-general-seats"
                      type="number"
                      min="1"
                      value={generalSeats}
                      onChange={(e) => setGeneralSeats(e.target.value)}
                      className="w-full rounded-md border border-slate-150 bg-white px-2.5 py-1 text-xs focus:border-[#2563EB] focus:outline-hidden font-semibold"
                    />
                  </div>
                </div>

                {/* VIP seating config */}
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/30 space-y-2">
                  <span className="block text-xs font-bold text-slate-800">VIP Ticket tier</span>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase">Price (₹)</label>
                    <input
                      id="form-vip-price"
                      type="number"
                      min="0"
                      value={vipPrice}
                      onChange={(e) => setVipPrice(e.target.value)}
                      className="w-full rounded-md border border-slate-150 bg-white px-2.5 py-1 text-xs focus:border-[#2563EB] focus:outline-hidden font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase">Seats Cap</label>
                    <input
                      id="form-vip-seats"
                      type="number"
                      min="1"
                      value={vipSeats}
                      onChange={(e) => setVipSeats(e.target.value)}
                      className="w-full rounded-md border border-slate-150 bg-white px-2.5 py-1 text-xs focus:border-[#2563EB] focus:outline-hidden font-semibold"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              id="form-submit-event"
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#2563EB] py-3 text-sm font-bold text-white shadow-xs transition-all hover:bg-[#1D4ED8] hover:shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Publish Live Event
            </button>
          </form>
        </div>
      )}

      {/* Global Bookings Logs View */}
      {activeTab === 'bookings' && (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Global Sales Ledger</h2>
              <p className="text-xs text-slate-400 font-semibold">Consolidated billing and audience database.</p>
            </div>

            {/* Live Search Input */}
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                id="bookings-search-input"
                type="text"
                placeholder="Search name, email, booking ID, event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-150 pl-9 pr-3.5 py-2 text-xs focus:border-[#2563EB] focus:outline-hidden placeholder-slate-400 font-medium"
              />
            </div>
          </div>

          {filteredBookings.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-slate-150">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-150 font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">ID / Date</th>
                    <th className="p-3.5">Event Name</th>
                    <th className="p-3.5">Attendee Info</th>
                    <th className="p-3.5 text-center">Tier</th>
                    <th className="p-3.5 text-center">Qty</th>
                    <th className="p-3.5 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-slate-600 font-medium">
                  {filteredBookings.map((bk) => (
                    <tr key={bk.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5">
                        <span className="block font-mono font-bold text-[#2563EB] bg-blue-50/50 border border-blue-100/30 px-1.5 py-0.5 rounded-sm w-fit text-[10px]">
                          {bk.id}
                        </span>
                        <span className="text-[9px] text-slate-400 mt-1 block font-semibold">
                          {new Date(bk.bookingDate).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-800 max-w-[150px] truncate">
                        {bk.eventName}
                      </td>
                      <td className="p-3.5">
                        <span className="block font-bold text-slate-800">{bk.customerName}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{bk.customerEmail}</span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          bk.ticketTypeName === 'VIP'
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-slate-50 text-slate-600 border border-slate-100'
                        }`}>
                          {bk.ticketTypeName}
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-bold text-slate-800">{bk.quantity}</td>
                      <td className="p-3.5 text-right font-extrabold text-slate-900">{formatINR(bk.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-slate-200">
              <FolderOpen className="h-10 w-10 text-slate-300 mb-2" />
              <span className="text-xs text-slate-500 font-semibold">No bookings match the search criteria.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
