import { messages } from '../constants/messages.js';
import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { getProfileVenues } from '../api/profiles.js';
import { managerBookingGroups } from '../utils/manager.js';
import ManagerBookingCard from '../components/bookings/ManagerBookingCard.jsx';
import Loading from '../components/Loading.jsx';
import BackLink from '../components/BackLink.jsx';

export default function VenueBookings() {
  const { user, request } = useAuth();
  const [params, setParams] = useSearchParams();
  const { state } = useLocation();
  const venueId = params.get('venue') || '';
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getProfileVenues(request, user.name, { bookings: true, signal: controller.signal }).then(venues => {
      const groups = managerBookingGroups(venues);
      if (!controller.signal.aborted) setData({ venues, groups });
    }).catch(error => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [request, user.name, attempt]);

  const unavailable = data && venueId && !data.venues.some(venue => venue.id === venueId);
  return <section className="min-w-0 space-y-6">
    <title>Holidaze | Venue bookings</title>
    <BackLink to="/manager" label="Back to dashboard" />
    <h1 className="text-h3 font-bold sm:text-h2">Venue bookings</h1>
    <p className="text-muted">Reservations for your venues.</p>
    {data && <label className="block max-w-lg text-small font-semibold">Venue
      <select value={venueId} onChange={event => setParams(event.target.value ? { venue: event.target.value } : {}, { state })} className="mt-2 min-h-12 w-full min-w-0 rounded-lg border border-border bg-surface px-3 font-normal">
        <option value="">All venues</option>
        {unavailable && <option value={venueId}>Unavailable venue</option>}
        {data.venues.map(venue => <option key={venue.id} value={venue.id}>{venue.name?.trim() || 'Unnamed stay'}</option>)}
      </select>
    </label>}
    {error && <p role="alert" className="text-danger">{messages.venueBookingsLoadFailed} {error}</p>}
    {!data && !error && <Loading>Loading venue bookings…</Loading>}
    {(data || error) && <button type="button" className="navigation-link" onClick={() => { setError(''); setData(null); setAttempt(value => value + 1); }}>{error ? 'Try again' : 'Refresh bookings'}</button>}
    {unavailable ? <p role="alert" className="text-danger">{messages.unavailableVenueFilter}</p>
      : data && (data.venues.length ? Object.entries(data.groups).map(([status, bookings]) => {
        const filtered = bookings.filter(booking => !venueId || booking.venue.id === venueId);
        return status === 'unknown' && !filtered.length ? null : <BookingGroup key={`${venueId}-${status}`} status={status} bookings={filtered} />;
      }) : <p className="empty-state rounded-xl border border-border bg-surface p-5 text-muted">You haven’t listed any venues yet. <Link to="/manager/venues/new" className="navigation-link">Create your first venue</Link> to receive bookings.</p>)}
  </section>;
}

function BookingGroup({ status, bookings }) {
  const [expanded, setExpanded] = useState(false);
  const title = { upcoming: 'Upcoming stays', current: 'Current stays', past: 'Past stays', unknown: 'Dates unavailable' }[status];
  return <section aria-label={title} className="min-w-0 space-y-3">
    <h2 className="text-h3 font-semibold">{title} <span className="text-small font-normal text-muted">({bookings.length})</span></h2>
    {!bookings.length ? <p className="empty-state text-muted">No {title.toLowerCase()}.</p> : <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {(expanded ? bookings : bookings.slice(0, 3)).map(booking => <li key={booking.id} className="min-w-0"><ManagerBookingCard booking={booking} /></li>)}
    </ul>}
    {bookings.length > 3 && <button type="button" aria-expanded={expanded} onClick={() => setExpanded(value => !value)} className="navigation-link">{expanded ? 'Show less' : `Show all (${bookings.length})`}</button>}
  </section>;
}
