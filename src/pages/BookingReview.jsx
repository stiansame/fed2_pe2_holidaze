import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { getVenue } from '../api/venues.js';
import { createBooking } from '../api/bookings.js';
import { stayFromSearch, staySummary } from '../utils/availability.js';
import StaySummary from '../components/bookings/StaySummary.jsx';

export default function BookingReview() {
  const { id } = useParams();
  const { search } = useLocation();
  return <Review key={id + search} id={id} search={search} />;
}

function Review({ id, search }) {
  const { request } = useAuth();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [pending, setPending] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const submitting = useRef(false);
  const stay = stayFromSearch(search);
  const summary = venue ? staySummary(venue, stay) : null;
  const edit = `/venues/${encodeURIComponent(id)}${search}`;

  useEffect(() => {
    window.scrollTo(0, 0);
    const controller = new AbortController();
    getVenue(id, { signal: controller.signal }).then(({ data }) => {
      if (!controller.signal.aborted) setVenue(data);
    }).catch(error => {
      if (!controller.signal.aborted) setError(error.message);
    });
    return () => controller.abort();
  }, [id, attempt]);

  async function confirm(event) {
    event.preventDefault();
    if (submitting.current || uncertain || !venue || summary.error) return;
    submitting.current = true;
    setPending(true);
    setError('');
    try {
      const result = await createBooking(request, id, stay, venue.price);
      setVenue(result.venue);
      if (!result.booking) {
        setError('The price has changed. Review the updated total before confirming again.');
        return;
      }
      navigate(`/bookings/${encodeURIComponent(result.booking.id)}/confirmation`, { replace: true });
    } catch (error) {
      setUncertain(!!error.bookingUncertain);
      setError(error.bookingUncertain ? 'We could not confirm whether your reservation was saved. Please verify your booking before reserving again.' : error.message);
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return <section className="mx-auto max-w-xl space-y-5 rounded-xl border border-border bg-surface p-5 sm:p-8" aria-busy={pending}>
    <title>Holidaze | Review booking</title>
    <h1 className="text-h3 font-bold">Review your booking</h1>
    {!venue && !error && <p role="status">Loading your stay…</p>}
    {venue && <>
      <StaySummary venue={venue} stay={stay} summary={summary} />
      {summary.error && <p role="alert" className="text-danger">{summary.error}</p>}
      <form onSubmit={confirm}>
        <button disabled={pending || uncertain || !!summary.error} className="min-h-12 w-full rounded-lg bg-primary px-4 font-semibold text-surface hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">{pending ? 'Reserving…' : 'Confirm reservation'}</button>
      </form>
    </>}
    {error && <p role="alert" className="whitespace-pre-line text-danger">{error}</p>}
    {!venue && error && <button onClick={() => { setError(''); setAttempt(value => value + 1); }} className="min-h-12 rounded-lg border border-border px-4 text-primary">Try again</button>}
    {!pending && <Link to={edit} className="navigation-link">Back to dates</Link>}
  </section>;
}
