import React, { useState, useEffect, useCallback } from 'react';
import { Ticket, Calendar, Search, Filter, ShieldCheck, BarChart2, Sparkles, AlertCircle } from 'lucide-react';
import { Event, Booking, EventType } from './types';
import { SAMPLE_EVENTS } from './data';
import EventCard from './components/EventCard';
import EventDetail from './components/EventDetail';
import BookingConfirmation from './components/BookingConfirmation';
import OrganizerDashboard from './components/OrganizerDashboard';
import { createBooking, createEvent, getBookings, getEvents } from './api/client';
import { formatINR } from './utils/formatCurrency';

export default function App() {
  // --- 1. STATE INITIALIZATION ---
  // Temporary UI bootstrap values. We will overwrite from backend on load.
  const [events, setEvents] = useState<Event[]>(() => SAMPLE_EVENTS);
  const [bookings, setBookings] = useState<Booking[]>(() => []);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string>('');

  // (no-op placeholder)



  const [currentView, setCurrentView] = useState<'catalog' | 'detail' | 'confirmation' | 'dashboard'>('catalog');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<EventType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // --- 2. BACKEND SYNC ---
  const refreshFromBackend = useCallback(async () => {
    // If backend is down, keep old UI rather than locking screen.

    setIsLoading(true);
    setLoadError('');
    try {
      const [nextEvents, nextBookings] = await Promise.all([getEvents(), getBookings()]);
      setEvents(nextEvents);
      setBookings(nextBookings);

      // Keep localStorage updated so existing UI assumptions still work on refresh.
      localStorage.setItem('etbs_events', JSON.stringify(nextEvents));
      localStorage.setItem('etbs_bookings', JSON.stringify(nextBookings));
    } catch (err) {
      console.error(err);
      setLoadError('Failed to load data from backend.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFromBackend();
  }, [refreshFromBackend]);



  // --- 3. FILTERING COMPUTATIONS ---
  const filteredEvents = events.filter((e) => {
    // 1. Category Filter
    if (selectedTypeFilter !== 'All' && e.type !== selectedTypeFilter) return false;

    // 2. Search query check
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      return (
        e.name.toLowerCase().includes(query) ||
        e.venue.toLowerCase().includes(query) ||
        e.organizerName.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // --- 4. CORE CONTROLLERS ---
  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setCurrentView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBooking = async (
    ticketTypeName: 'General' | 'VIP',
    quantity: number,
    customerName: string,
    customerEmail: string
  ) => {
    if (!selectedEventId) return;

    try {
      setLoadError('');

      const created = await createBooking({
        eventId: selectedEventId,
        eventName: events.find((e) => e.id === selectedEventId)?.name || '',
        eventDate: events.find((e) => e.id === selectedEventId)?.date || '',
        ticketTypeName,
        quantity,
        customerName,
        customerEmail
      });

      setActiveBooking(created);
      setCurrentView('confirmation');
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Update UI with backend truth (seats/bookings/revenue)
      await refreshFromBackend();
    } catch (err: any) {
      const message = typeof err?.message === 'string' ? err.message : 'Booking failed';
      alert(message);
    }
  };

  const handleAddEvent = async (newEventData: Omit<Event, 'id'>) => {
    try {
      setLoadError('');
      const created = await createEvent(newEventData as any);
      await refreshFromBackend();

      // If user is currently on dashboard, keep them there with updated data.
      setCurrentView('dashboard');
      setSelectedEventId(created?.id ?? null);
    } catch (err: any) {
      const message = typeof err?.message === 'string' ? err.message : 'Event creation failed';
      alert(message);
    }
  };

  // Find active event for Detail page
  const activeEvent = events.find((e) => e.id === selectedEventId);

  // Spotlight Event
  const spotlightEvent = events.find((e) => e.id === 'evt-1') || events[0];

  // Only block UI when we have no data at all.
  // This prevents cases where backend is temporarily unreachable.
  if (isLoading && events.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-sm font-bold text-[#1E293B]">Loading from backend...</div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans flex flex-col md:flex-row antialiased">
      {/* 1. BRAND SIDEBAR LAYER (Left on Desktop, Top on Mobile) */}
      <aside className="w-full md:w-[280px] bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col shrink-0 z-10">
        {/* Brand Banner */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between md:flex-col md:items-start md:gap-8">
          <div
            id="brand-logo"
            onClick={() => {
              setCurrentView('catalog');
              setSelectedTypeFilter('All');
            }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-sm font-extrabold text-lg transition-transform group-hover:scale-105">
              T
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-[#0F172A]">TicketFlow</span>
              <span className="hidden md:block text-[10px] font-bold text-slate-400 block -mt-1 uppercase tracking-wider">Secure Pass System</span>
            </div>
          </div>

          {/* Quick Stats Summary for Mobile context helper */}
          <div className="md:hidden flex items-center gap-2">
            <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded-md">
              REV: {formatINR(bookings.reduce((sum, b) => sum + b.totalAmount, 0))}
            </span>
          </div>
        </div>

        {/* Sidebar Nav Actions */}
        <div className="p-4 space-y-1 my-2 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible shrink-0 scrollbar-none gap-2 md:gap-0">
          <button
            id="nav-catalog-btn"
            onClick={() => {
              setCurrentView('catalog');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 cursor-pointer shrink-0 ${
              currentView === 'catalog' || currentView === 'detail' || currentView === 'confirmation'
                ? 'bg-[#EFF6FF] text-[#2563EB]'
                : 'text-[#64748B] hover:text-[#1E293B] hover:bg-slate-50'
            }`}
          >
            <Calendar className="h-4 w-4 shrink-0" />
            <span>Discover Events</span>
          </button>

          <button
            id="nav-dashboard-btn"
            onClick={() => {
              setCurrentView('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 cursor-pointer shrink-0 ${
              currentView === 'dashboard'
                ? 'bg-[#EFF6FF] text-[#2563EB]'
                : 'text-[#64748B] hover:text-[#1E293B] hover:bg-slate-50'
            }`}
          >
            <BarChart2 className="h-4 w-4 shrink-0" />
            <span>Organizer Dashboard</span>
          </button>
        </div>

        {/* Live Metrics sidebar panel (Just like layout specifications in HTML) */}
        <div className="mt-auto p-5 border-t border-slate-100 bg-[#F8FAFC]/50 hidden md:block">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[#94A3B8] mb-3">Organizer Insights</div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-150 mb-3 flex flex-col shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-[#94A3B8]">Live Ticket Sales</span>
            <span className="text-xl font-extrabold text-[#0F172A] mt-0.5" id="sidebar-live-tickets">
              {bookings.reduce((sum, b) => sum + b.quantity, 0)}
            </span>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-150 flex flex-col shadow-2xs">
            <span className="text-[10px] uppercase font-bold text-[#94A3B8]">Revenue (INR)</span>
            <span className="text-xl font-extrabold text-[#0F172A] mt-0.5" id="sidebar-live-revenue">
              {formatINR(bookings.reduce((sum, b) => sum + b.totalAmount, 0))}
            </span>
          </div>
        </div>
      </aside>

      {/* 2. MAIN HUB AREA */}
      <main className="flex-1 min-w-0 flex flex-col">
        {currentView === 'catalog' && (
          <div className="p-5 md:p-10 space-y-8 max-w-6xl w-full mx-auto">
            
            {/* Header section with brand search */}
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">Featured Experience</h1>
                <p className="text-xs text-slate-400 font-semibold mt-1">Handpicked elite local events for you this weekend</p>
              </div>

              {/* Dynamic Search */}
              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  id="event-search-input"
                  type="text"
                  placeholder="Search name, venue, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 focus:outline-hidden placeholder-slate-400 text-slate-800 font-semibold shadow-2xs"
                />
              </div>
            </header>

            {/* A. SPOTLIGHT FEATURED HERO (From HTML blueprint) */}
            {spotlightEvent && (
              <section className="h-[240px] w-full bg-gradient-to-r from-[#1E293B] to-[#0F172A] rounded-3xl p-6 md:p-8 text-white relative overflow-hidden flex flex-col justify-end shadow-md">
                {/* Decorative spotlight blur elements */}
                <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="absolute top-8 left-8 bg-white/10 backdrop-blur-md px-3 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase">
                  Featured Spotlight
                </div>
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10">
                  <div className="space-y-1">
                    <h2 className="text-xl md:text-3xl font-black tracking-tight" id="spotlight-title">
                      {spotlightEvent.name}
                    </h2>
                    <p className="text-slate-300 text-xs md:text-sm font-semibold">
                      {spotlightEvent.venue} • {new Date(spotlightEvent.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} • {spotlightEvent.time} PM
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleSelectEvent(spotlightEvent.id)}
                    className="bg-white hover:bg-slate-50 text-[#0F172A] font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-lg hover:scale-102 cursor-pointer shrink-0"
                  >
                    Book Now — From {formatINR(Math.min(...spotlightEvent.ticketTypes.map((t) => t.price)))}
                  </button>
                </div>
              </section>
            )}

            {/* B. CATEGORY FILTER CHIPS NAVBAR */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wider">Explore Nearby</h2>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                {(['All', 'Concert', 'Workshop', 'Meetup', 'Sports', 'Comedy'] as const).map((cat) => {
                  const isActive = selectedTypeFilter === cat;
                  return (
                    <button
                      key={cat}
                      id={`filter-${cat.toLowerCase()}`}
                      onClick={() => setSelectedTypeFilter(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                          : 'bg-white text-[#64748B] border-slate-200 hover:border-slate-350 hover:text-[#1E293B]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* C. ALL EVENT COMPONENT GRID */}
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="event-grid">
                {filteredEvents.map((evt) => (
                  <EventCard key={evt.id} event={evt} onSelect={handleSelectEvent} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                <AlertCircle className="h-10 w-10 text-slate-300 mb-2" />
                <h3 className="text-sm font-bold text-slate-800">No events found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs text-center leading-relaxed">
                  We details couldn't find matching coordinates. Try resetting your query search strings or choosing alternative classifications.
                </p>
                <button
                  id="reset-filters-btn"
                  onClick={() => {
                    setSelectedTypeFilter('All');
                    setSearchQuery('');
                  }}
                  className="mt-4 rounded-lg bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-[#2563EB] hover:bg-blue-100 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* D. ORGANIZER PERFORMANCE TIP BAR */}
            <section className="bg-[#EFF6FF] border border-blue-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex gap-4 items-center">
                <div className="bg-[#2563EB] text-white font-extrabold rounded-lg w-10 h-10 flex items-center justify-center text-sm">
                  !
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Organizer Live Status Tip</h4>
                  <p className="text-xs text-blue-800 font-medium">VIP ticket passes for live entertainment events are concluding 40% quicker than basic General tiers.</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setCurrentView('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-transparent border border-[#2563EB] text-[#2563EB] hover:bg-blue-50/50 transition-colors px-4 py-2 rounded-xl font-bold text-xs cursor-pointer shrink-0"
              >
                View Sales Report
              </button>
            </section>
          </div>
        )}

        {/* Dynamic Detail Render */}
        {currentView === 'detail' && activeEvent && (
          <EventDetail
            event={activeEvent}
            onBack={() => setCurrentView('catalog')}
            onBook={handleBooking}
          />
        )}

        {/* Dynamic Confirmation Render */}
        {currentView === 'confirmation' && activeBooking && (
          <BookingConfirmation
            booking={activeBooking}
            onClose={() => {
              setActiveBooking(null);
              setCurrentView('catalog');
            }}
          />
        )}

        {/* Dynamic Dashboard Render */}
        {currentView === 'dashboard' && (
          <OrganizerDashboard
            events={events}
            bookings={bookings}
            onAddEvent={handleAddEvent}
          />
        )}
      </main>
    </div>
  );
}

