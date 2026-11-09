import Loading from '../Loading.jsx';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.js';
import { cancelBooking, getOwnBookings } from '../../api/bookings.js';
import { bookingStatus, groupBookings } from '../../utils/bookings.js';
import BookingCardDetails from './BookingCardDetails.jsx';
import Icon from '../Icon.jsx';
import VenueImage from '../venues/VenueImage.jsx';
import { navigationOrigin } from '../../utils/navigation.js';

export default function BookingsList({ upcomingOnly = false }) {
  const { user, request } = useAuth();
  const { search, state } = useLocation();
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [notice, setNotice] = useState(upcomingOnly ? '' : state?.notice || '');

  useEffect(() => {
    const controller = new AbortController();
    getOwnBookings(request, user.name, { signal: controller.signal }).then(data => {
      if (!controller.signal.aborted) setBookings(data);
    }).catch(error => {
      if (!controller.signal.aborted) setError(error.message);
    });
    return () => controller.abort();
  }, [request, user.name, attempt]);

  const groups = bookings ? groupBookings(bookings) : null;
  return <div className="space-y-6">
    {notice && <p role="status" className="text-success">{notice}</p>}
    {bookings?.length > 0 && <p className="text-small text-muted">Prices are estimates based on the venue’s current nightly rate.</p>}
    {error && <p role="alert" className="text-danger">{error}</p>}
    {!bookings && !error && <Loading>Loading your bookings…</Loading>}
    {(bookings || error) && <button type="button" onClick={() => { setError(''); setBookings(null); setAttempt(value => value + 1); }} className="min-h-12 rounded-lg border border-border bg-surface px-4 text-small font-semibold text-primary hover:bg-tint">{error ? 'Try again' : 'Refresh bookings'}</button>}
    {groups && Object.entries(groups).filter(([key, values]) => upcomingOnly ? key === 'upcoming' : key !== 'unknown' || values.length > 0).map(([key, values]) => <BookingGroup
      key={key}
      title={key === 'upcoming' ? 'Upcoming stays' : key === 'past' ? 'Past stays' : 'Dates unavailable'}
      bookings={values}
      manage={!upcomingOnly}
      allLink={upcomingOnly ? '/bookings?show=upcoming' : undefined}
      initialExpanded={new URLSearchParams(search).get('show') === key}
      onCancelled={id => { setBookings(current => current?.filter(booking => booking.id !== id) ?? current); setNotice('Booking cancelled.'); }}
    />)}
  </div>;
}

function BookingGroup({ title, bookings, manage, allLink, initialExpanded, onCancelled }) {
  const [expanded, setExpanded] = useState(initialExpanded && !allLink);
  return <section aria-label={title} className="space-y-4">
    <h2 className="text-h3 font-bold">{title} <span className="text-small font-normal text-muted">({bookings.length})</span></h2>
    {bookings.length === 0 ? <p className="text-muted">No {title.toLowerCase()} yet.</p> : <ul className="space-y-4">
      {(expanded ? bookings : bookings.slice(0, 3)).map(booking => <li key={booking.id}><BookingCard booking={booking} manage={manage} onCancelled={onCancelled} /></li>)}
    </ul>}
    {bookings.length > 3 && (allLink ? <Link to={allLink} className="inline-flex min-h-12 items-center rounded-lg border border-border bg-surface px-4 font-semibold text-primary hover:bg-tint">Show all ({bookings.length})</Link>
      : <button type="button" aria-expanded={expanded} onClick={() => setExpanded(value => !value)} className="min-h-12 rounded-lg border border-border bg-surface px-4 font-semibold text-primary hover:bg-tint">{expanded ? 'Show less' : `Show all (${bookings.length})`}</button>)}
  </section>;
}

function BookingCard({ booking, manage, onCancelled }) {
  const routeLocation = useLocation();
  const { user, request } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const status = bookingStatus(booking);
  const editable = status === 'upcoming';
  const name = booking.venue?.name?.trim() || 'Venue unavailable';
  const venueLink = booking.venue?.id ? `/venues/${encodeURIComponent(booking.venue.id)}` : null;

  async function cancel() {
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setError('');
    try {
      await cancelBooking(request, booking.id, user.name);
      onCancelled(booking.id);
    } catch (error) {
      setError(`${error.message} Refresh your bookings if the cancellation outcome is unclear.`);
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return <article className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-surface sm:flex-row" aria-label={name}>
    <div className="relative shrink-0 sm:w-52">
      <VenueImage key={booking.venue?.media?.[0]?.url} media={booking.venue?.media?.[0]} name={name} className="relative aspect-video sm:absolute sm:inset-0 sm:aspect-auto" imageClass="absolute inset-0 object-cover" />
      {manage && editable && <details className="absolute right-2 top-2 z-10" onKeyDown={event => {
        if (event.key === 'Escape') { event.currentTarget.open = false; event.currentTarget.querySelector('summary').focus(); }
      }}>
        <summary aria-label="Manage booking" className="flex size-11 cursor-pointer list-none items-center justify-center rounded-lg border border-border bg-surface text-primary shadow-sm [&::-webkit-details-marker]:hidden"><Icon name="edit" /></summary>
        <div className="absolute right-0 mt-2 grid w-44 gap-1 rounded-lg border border-border bg-surface p-2 shadow-lg">
          {venueLink && !pending && <Link to={`/bookings/${encodeURIComponent(booking.id)}/edit`} state={navigationOrigin(routeLocation)} className="flex min-h-11 items-center gap-2 rounded px-2 text-small font-semibold text-primary hover:bg-tint"><Icon name="edit" />Change booking</Link>}
          <button type="button" disabled={pending} onClick={event => { setConfirming(true); event.currentTarget.closest('details').open = false; }} className="flex min-h-11 items-center gap-2 rounded px-2 text-left text-small font-semibold text-danger hover:bg-danger/10"><Icon name="trash" />Cancel booking</button>
        </div>
      </details>}
    </div>
    <div className="min-w-0 flex-1 space-y-3 p-4">
    <BookingCardDetails booking={booking} title={venueLink ? <Link to={venueLink} state={navigationOrigin(routeLocation)} className="text-primary hover:underline">{name}</Link> : name} />
    {confirming && <div className="space-y-3 rounded-lg bg-danger/5 p-3">
      <p className="text-small">Cancel your stay at {name}? This removes the booking and cannot be undone.</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" autoFocus disabled={pending} onClick={cancel} className="min-h-12 rounded-lg bg-danger px-3 text-small font-semibold text-surface disabled:opacity-60">{pending ? 'Cancelling…' : 'Confirm cancellation'}</button>
        <button type="button" disabled={pending} onClick={() => { setConfirming(false); setError(''); }} className="min-h-12 rounded-lg border border-border bg-surface px-3 text-small font-semibold text-primary disabled:opacity-60">Keep booking</button>
      </div>
    </div>}
    {error && <p role="alert" className="text-small text-danger">{error}</p>}
    </div>
  </article>;
}
