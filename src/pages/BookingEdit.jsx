import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { getOwnBooking, updateBooking } from '../api/bookings.js';
import { getVenue } from '../api/venues.js';
import { bookingDates, bookingStatus } from '../utils/bookings.js';
import { staySummary } from '../utils/availability.js';
import AvailabilityCalendar from '../components/venues/AvailabilityCalendar.jsx';
import StaySummary from '../components/bookings/StaySummary.jsx';

export default function BookingEdit() {
  const { id } = useParams();
  return <EditLoader key={id} id={id} />;
}

function EditLoader({ id }) {
  const { user, request } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      const booking = await getOwnBooking(request, id, user.name, { signal: controller.signal });
      if (bookingStatus(booking) !== 'upcoming') throw new Error('Only stays that have not started can be changed.');
      if (!booking.venue?.id) throw new Error('This venue is no longer available.');
      const { data: venue } = await getVenue(booking.venue.id, { signal: controller.signal });
      if (!controller.signal.aborted) setData({ booking, venue });
    }
    load().catch(error => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [id, request, user.name, attempt]);

  return <section className="mx-auto max-w-xl space-y-5 rounded-xl border border-border bg-surface p-4 sm:p-6">
    <title>Holidaze | Change booking</title>
    <h1 className="text-h3 font-bold">Change booking</h1>
    {!data && !error && <p role="status">Loading your booking…</p>}
    {data && <BookingEditor booking={data.booking} initialVenue={data.venue} />}
    {error && <><p role="alert" className="text-danger">{error}</p><button type="button" onClick={() => { setError(''); setAttempt(value => value + 1); }} className="min-h-12 rounded-lg border border-border px-4 text-primary">Try again</button></>}
    <Link to="/bookings" className="inline-block py-2 text-primary underline">Back to my bookings</Link>
  </section>;
}

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
        setError('The price has changed. Review the updated total before saving again.');
        return;
      }
      navigate('/bookings', { replace: true, state: { notice: 'Booking updated.' } });
    } catch (error) {
      setError(error.message);
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return reviewing ? <div className="space-y-5">
    <StaySummary venue={venue} stay={stay} summary={summary} />
    {summary.error && <p role="alert" className="text-danger">{summary.error}</p>}
    <form onSubmit={save}><button disabled={pending || !!summary.error} className="min-h-12 w-full rounded-lg bg-primary px-4 font-semibold text-surface hover:bg-primary-hover disabled:opacity-60">{pending ? 'Saving…' : 'Save changes'}</button></form>
    <button type="button" disabled={pending} onClick={() => { setReviewing(false); setError(''); }} className="min-h-12 rounded-lg border border-border px-4 text-primary disabled:opacity-60">Back to dates</button>
    {error && <p role="alert" className="text-danger">{error}</p>}
  </div> : <AvailabilityCalendar
    bookings={venue.bookings?.filter(item => item.id !== booking.id)} maxGuests={venue.maxGuests}
    initialStay={stay} actionLabel="Review changes" onReserve={selection => { setStay(selection); setReviewing(true); }}
  />;
}
