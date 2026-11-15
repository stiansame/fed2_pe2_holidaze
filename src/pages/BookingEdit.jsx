import DocumentTitle from '../components/DocumentTitle.jsx';
import { messages } from '../constants/messages.js';
import Loading from '../components/Loading.jsx';
import BackLink from '../components/BackLink.jsx';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { getOwnBooking, updateBooking } from '../api/bookings.js';
import { getVenue } from '../api/venues.js';
import { bookingDates, bookingStatus } from '../utils/bookings.js';
import { staySummary } from '../utils/availability.js';
import AvailabilityCalendar from '../components/venues/AvailabilityCalendar.jsx';
import StaySummary from '../components/bookings/StaySummary.jsx';

/**
 * Resets the booking editor when the route ID changes.
 * @returns {import('react').ReactNode}
 */
export default function BookingEdit() {
  const { id } = useParams();
  return <EditLoader key={id} id={id} />;
}

/**
 * Loads an editable customer booking and fresh venue data before showing its editor.
 * @param {object} props Component props.
 * @param {string} props.id Route record ID.
 * @returns {import('react').ReactNode}
 */
function EditLoader({ id }) {
  const { user, request } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    /**
     * Checks booking ownership and future-stay eligibility before loading fresh venue data.
     * @returns {Promise<void>}
     */
    async function load() {
      const booking = await getOwnBooking(request, id, user.name, { signal: controller.signal });
      if (bookingStatus(booking) !== 'upcoming') throw new Error(messages.bookingNotChangeable);
      if (!booking.venue?.id) throw new Error(messages.venueUnavailable);
      const { data: venue } = await getVenue(booking.venue.id, { signal: controller.signal });
      if (!controller.signal.aborted) setData({ booking, venue });
    }
    load().catch(error => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [id, request, user.name, attempt]);

  return <section className="mx-auto max-w-xl space-y-5 rounded-xl border border-border bg-surface p-4 sm:p-6">
    <DocumentTitle>Holidaze | Change booking</DocumentTitle>
    <h1 className="text-h3 font-bold">Change booking</h1>
    {!data && !error && <Loading>Loading your booking…</Loading>}
    {data && <BookingEditor booking={data.booking} initialVenue={data.venue} />}
    {error && <><p role="alert" className="text-danger">{error}</p><button type="button" onClick={() => { setError(''); setAttempt(value => value + 1); }} className="h-11 rounded-lg border border-border px-4 text-primary">Try again</button></>}
    {!data && <BackLink to="/bookings" label="Back to my stays" shortLabel />}
  </section>;
}

/**
 * Reviews or discards changed dates/guests, requesting another review if the price changed.
 * @param {object} props Component props.
 * @param {object} props.booking Booking with related venue/customer data.
 * @param {object} props.initialVenue Fresh venue data loaded for editing.
 * @returns {import('react').ReactNode}
 */
function BookingEditor({ booking, initialVenue }) {
  const { request, user } = useAuth();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(initialVenue);
  const [stay, setStay] = useState(() => bookingDates(booking));
  const [reviewing, setReviewing] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const summary = staySummary(venue, stay, booking.id);

  /**
   * Saves reviewed booking changes or asks for review again when the price changed.
   * @param {import('react').SubmitEvent<HTMLFormElement>} event Form submission event.
   * @returns {Promise<void>}
   */
  async function save(event) {
    event.preventDefault();
    if (submitting.current || summary.error) return;
    submitting.current = true;
    setPending(true);
    setError('');
    try {
      const result = await updateBooking(request, booking.id, user.name, stay, venue.price);
      setVenue(result.venue);
      if (!result.booking) {
        setError(messages.bookingEditPriceChanged);
        return;
      }
      navigate('/bookings', { replace: true, state: { notice: messages.bookingUpdated } });
    } catch (error) {
      setError(error.message);
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  const cancelAction = <button type="button" disabled={pending} onClick={() => navigate('/bookings', { replace: true })} className="navigation-link justify-center text-small disabled:opacity-60">Cancel changes</button>;

  return reviewing ? <div className="space-y-5">
    <StaySummary venue={venue} stay={stay} summary={summary} />
    {summary.error && <p role="alert" className="text-danger">{summary.error}</p>}
    <form onSubmit={save}><button disabled={pending || !!summary.error} className="h-11 w-full rounded-lg bg-primary px-4 text-small font-semibold text-surface hover:bg-primary-hover disabled:opacity-60">{pending ? 'Saving…' : 'Save changes'}</button></form>
    <div className="grid grid-cols-2 items-stretch gap-2">
      <button type="button" disabled={pending} onClick={() => { setReviewing(false); setError(''); }} className="navigation-link justify-center text-small disabled:opacity-60">Back to dates</button>
      {cancelAction}
    </div>
    {error && <p role="alert" className="text-danger">{error}</p>}
  </div> : <AvailabilityCalendar
    bookings={venue.bookings?.filter(item => item.id !== booking.id)} maxGuests={venue.maxGuests}
    actions={cancelAction}
    initialStay={stay} actionLabel="Review changes" onReserve={selection => { setStay(selection); setReviewing(true); }}
  />;
}
