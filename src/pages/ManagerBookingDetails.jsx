import DocumentTitle from '../components/DocumentTitle.jsx';
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { getVenueBooking } from '../api/bookings.js';
import { getVenue } from '../api/venues.js';
import AvailabilityCalendar from '../components/venues/AvailabilityCalendar.jsx';
import { bookingDates, bookingPrice, formatBookingDate } from '../utils/bookings.js';
import Loading from '../components/Loading.jsx';
import HostAvatar from '../components/HostAvatar.jsx';
import Icon from '../components/Icon.jsx';
import VenueImage from '../components/venues/VenueImage.jsx';
import StaySummary from '../components/bookings/StaySummary.jsx';
import BackLink from '../components/BackLink.jsx';
import { navigationOrigin } from '../utils/navigation.js';

export default function ManagerBookingDetails() {
  const { id } = useParams();
  return <BookingDetails key={id} id={id} />;
}

function BookingDetails({ id }) {
  const { request, user } = useAuth();
  const location = useLocation();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const controller = new AbortController();
    async function load() {
      const data = await getVenueBooking(request, id, user.name, { signal: controller.signal });
      const { data: venue } = await getVenue(data.venue.id, { signal: controller.signal });
      if (!controller.signal.aborted) setBooking({ ...data, venue });
    }
    load().catch(error => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [id, request, user.name, attempt]);

  const venue = booking?.venue;
  const guest = booking?.customer;
  const price = booking ? bookingPrice(booking) : null;
  const address = [venue?.location?.address, venue?.location?.zip, venue?.location?.city, venue?.location?.country]
    .map(value => value?.trim()).filter(Boolean).join(', ');
  return <section className="min-w-0 space-y-5">
    <DocumentTitle>Holidaze | Booking details</DocumentTitle>
    {!booking && <BackLink to="/manager/bookings" label="Back to venue bookings" shortLabel />}
    <h1 className="text-h3 font-bold sm:text-h2">Booking details</h1>
    {error ? <div role="alert" className="space-y-3">
      <p className="text-danger">{error}</p>
      <button type="button" className="navigation-link" onClick={() => { setError(''); setAttempt(value => value + 1); }}>Try again</button>
    </div> : !booking ? <Loading>Loading booking details…</Loading> : <div className="grid min-w-0 items-start gap-5 lg:grid-cols-2">
      <section aria-label="Booked venue" className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface">
        <VenueImage media={venue.media?.[0]} name={venue.name?.trim() || 'Unnamed stay'} className="h-44 sm:h-56" />
        <div className="space-y-4 p-4 sm:p-5">
          <StaySummary venue={venue} stay={bookingDates(booking)} summary={{ nights: price?.nights, total: price?.total, error: !price }} />
          <p className="flex items-start gap-2 text-small text-muted"><Icon name="pin" className="mt-0.5 size-4 shrink-0 text-success" /><span className="min-w-0 wrap-anywhere">{address || 'Location not specified'}</span></p>
          <p className="text-small text-muted">Prices are estimates based on the venue’s current nightly rate.</p>
          <div className="flex flex-wrap gap-2">
            <Link to={`/venues/${encodeURIComponent(venue.id)}`} state={navigationOrigin(location)} className="navigation-link">View venue</Link>
            <BackLink to="/manager/bookings" label="Back to venue bookings" shortLabel />
          </div>
        </div>
      </section>
      <section aria-label="Booking and guest" className="min-w-0 space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
        <h2 className="text-h3 font-semibold">Guest</h2>
        <div className="flex items-center gap-3">
          <HostAvatar media={guest?.avatar} className="size-14" />
          <div className="min-w-0 space-y-1">
            <p className="font-semibold wrap-anywhere">{guest?.name?.trim() || 'Guest name unavailable'}</p>
            {guest?.email?.trim() && <p className="text-small text-muted wrap-anywhere">{guest.email.trim()}</p>}
          </div>
        </div>
        {guest?.bio?.trim() && <p className="whitespace-pre-line text-muted wrap-anywhere">{guest.bio}</p>}
        {guest?.name && <Link to={`/profiles/${encodeURIComponent(guest.name)}`} state={navigationOrigin(location)} className="navigation-link">View guest profile</Link>}
        <dl className="space-y-3 border-t border-border pt-4">
          {[['Booking reference', booking.id], ['Booked on', formatBookingDate(booking.created)]].map(([label, value]) => <div key={label}><dt className="text-small text-muted">{label}</dt><dd className="wrap-anywhere">{value}</dd></div>)}
        </dl>
      </section>
      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface lg:col-start-1">
        <AvailabilityCalendar bookings={venue.bookings} maxGuests={venue.maxGuests} initialStay={bookingDates(booking)} readOnly />
      </div>
    </div>}
  </section>;
}
