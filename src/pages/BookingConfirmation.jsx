import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { getOwnBooking } from '../api/bookings.js';

export default function BookingConfirmation() {
  const { id } = useParams();
  const { request, user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const controller = new AbortController();
    getOwnBooking(request, id, user.name, { signal: controller.signal }).then(data => {
      if (controller.signal.aborted) return;
      setBooking(data);
    }).catch(error => {
      if (!controller.signal.aborted) setError(error.message);
    });
    return () => controller.abort();
  }, [id, request, user.name, attempt]);

  return <section className="mx-auto max-w-xl space-y-5 rounded-xl border border-border bg-surface p-5 sm:p-8">
    <title>Holidaze | Booking confirmation</title>
    <h1 className="text-h3 font-bold">{booking ? 'Booking confirmed' : 'Booking confirmation'}</h1>
    {!booking && !error && <p role="status">Loading your reservation…</p>}
    {booking && <>
      <p role="status" className="text-success">Your reservation is saved.</p>
      <h2 className="text-h3 font-semibold wrap-anywhere">{booking.venue?.name || 'Your stay'}</h2>
      <dl className="space-y-3">
        {[['Booking reference', booking.id], ['Check-in', booking.dateFrom.slice(0, 10)], ['Check-out', booking.dateTo.slice(0, 10)], ['Guests', booking.guests]].map(([label, value]) => <div key={label}><dt className="text-small text-muted">{label}</dt><dd className="font-semibold wrap-anywhere">{value}</dd></div>)}
      </dl>
      {booking.venue?.id && <Link to={`/venues/${encodeURIComponent(booking.venue.id)}`} className="inline-block py-2 text-primary underline">View venue</Link>}
    </>}
    {error && <><p role="alert" className="text-danger">Your reservation may already be saved, but its details could not be loaded: {error}</p><button onClick={() => { setError(''); setAttempt(value => value + 1); }} className="min-h-12 rounded-lg border border-border px-4 text-primary">Reload confirmation</button></>}
    <Link to="/bookings" className="block py-2 text-primary underline">My bookings</Link>
    <Link to="/venues" className="block py-2 text-primary underline">Explore venues</Link>
  </section>;
}
