import { messages } from '../../constants/messages.js';
import Loading from '../Loading.jsx';
import SectionHeading from '../account/SectionHeading.jsx';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.js';
import { cancelBooking, getOwnBookings } from '../../api/bookings.js';
import { bookingStatus, groupBookings } from '../../utils/bookings.js';
import BookingCardDetails from './BookingCardDetails.jsx';
import EditMenu from '../EditMenu.jsx';
import Icon from '../Icon.jsx';
import VenueImage from '../venues/VenueImage.jsx';
import Rating from '../venues/Rating.jsx';
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
    {!upcomingOnly && bookings?.length > 0 && <p className="text-muted">Prices are estimates based on the venue’s current nightly rate.</p>}
    {error && <p role="alert" className="text-danger">{error}</p>}
    {!bookings && !error && <Loading>Loading your bookings…</Loading>}
    {error && <button type="button" onClick={() => { setError(''); setBookings(null); setAttempt(value => value + 1); }} className="h-11 rounded-lg border border-border bg-surface px-4 text-small font-semibold text-primary hover:bg-tint">Try again</button>}
    {groups && Object.entries(groups).filter(([key, values]) => upcomingOnly ? key === 'upcoming' : key !== 'unknown' || values.length > 0).map(([key, values]) => <BookingGroup
      key={key}
      title={key === 'upcoming' ? 'My upcoming stays' : key === 'past' ? 'Past stays' : 'Dates unavailable'}
      bookings={values}
      manage={!upcomingOnly}
      allLink={upcomingOnly ? '/bookings?show=upcoming' : undefined}
      initialExpanded={new URLSearchParams(search).get('show') === key}
      onCancelled={id => { setBookings(current => current?.filter(booking => booking.id !== id) ?? current); setNotice(messages.bookingCancelled); }}
    />)}
  </div>;
}

function BookingGroup({ title, bookings, manage, allLink, initialExpanded, onCancelled }) {
  const [expanded, setExpanded] = useState(initialExpanded && !allLink);
  return <section aria-label={title} className={allLink ? 'space-y-4' : 'account-section'}>
    <SectionHeading title={title} count={bookings.length} to={bookings.length > 3 ? allLink : undefined} expanded={expanded} onToggle={!allLink && bookings.length > 3 ? () => setExpanded(value => !value) : undefined} />
    {bookings.length === 0 ? <p className="empty-state text-muted">No {title.replace(/^My /, '').toLowerCase()} yet.</p> : <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {(expanded ? bookings : bookings.slice(0, 3)).map(booking => <li key={booking.id} className="min-w-0"><BookingCard booking={booking} manage={manage} onCancelled={onCancelled} /></li>)}
    </ul>}

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
      setError(messages.cancellationUnclear(error.message));
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-surface" aria-label={name}>
    <div className="relative shrink-0">
      <VenueImage key={booking.venue?.media?.[0]?.url} media={booking.venue?.media?.[0]} name={name} className="relative aspect-video" imageClass={`absolute inset-0 object-cover ${status === 'past' ? 'saturate-25' : ''}`} />
      <Rating rating={booking.venue?.rating} className="absolute top-3 right-3" />
      {manage && editable && <div className="absolute bottom-3 right-3 z-10"><EditMenu label="Manage booking">
        {venueLink && !pending && <Link to={`/bookings/${encodeURIComponent(booking.id)}/edit`} state={navigationOrigin(routeLocation)} className="edit-menu-item"><Icon name="edit" />Change booking</Link>}
        <button type="button" disabled={pending} onClick={event => { setConfirming(true); event.currentTarget.closest('details').open = false; }} className="edit-menu-item edit-menu-danger"><Icon name="trash" />Cancel booking</button>
      </EditMenu></div>}
    </div>
    <div className="min-w-0 flex-1 space-y-3 p-4">
    <BookingCardDetails booking={booking} title={venueLink ? <Link to={venueLink} state={navigationOrigin(routeLocation)} className="text-primary hover:underline">{name}</Link> : name} />
    {confirming && <div className="space-y-3 rounded-lg bg-danger/5 p-3">
      <p className="text-small">{messages.confirmBookingCancellation(name)}</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" autoFocus disabled={pending} onClick={cancel} className="h-11 rounded-lg bg-danger px-3 text-small font-semibold text-surface disabled:opacity-60">{pending ? 'Cancelling…' : 'Confirm cancellation'}</button>
        <button type="button" disabled={pending} onClick={() => { setConfirming(false); setError(''); }} className="h-11 rounded-lg border border-border bg-surface px-3 text-small font-semibold text-primary disabled:opacity-60">Keep booking</button>
      </div>
    </div>}
    {error && <p role="alert" className="text-small text-danger">{error}</p>}
    </div>
  </article>;
}
