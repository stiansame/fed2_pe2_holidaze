import Loading from '../Loading.jsx';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.js';
import { getProfileVenues } from '../../api/profiles.js';
import { managerSummary } from '../../utils/manager.js';
import ManagerBookingCard from '../bookings/ManagerBookingCard.jsx';
import VenueCard from '../venues/VenueCard.jsx';
import Icon from '../Icon.jsx';
import SectionHeading from './SectionHeading.jsx';
import { navigationOrigin } from '../../utils/navigation.js';

export default function ManagerOverview({ children }) {
  const location = useLocation();
  const { user, request } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getProfileVenues(request, user.name, { bookings: true, signal: controller.signal }).then(venues => {
      if (!controller.signal.aborted) setData({ venues, ...managerSummary(venues) });
    }).catch(error => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [request, user.name, attempt]);

  const bookings = data ? [...data.current, ...data.upcoming].sort((a, b) => a.dateFrom.localeCompare(b.dateFrom)) : [];
  return <section className="min-w-0 space-y-6">
    <div className="grid items-start gap-4 lg:grid-cols-2">
      {children}
      <div className="min-w-0 self-stretch">
        {error ? <div role="alert" className="space-y-3">
          <p>Unable to load your venue overview. {error}</p>
          <button type="button" className="navigation-link" onClick={() => { setError(''); setAttempt(value => value + 1); }}>Try again</button>
        </div> : !data ? <Loading>Loading your venue overview…</Loading> : <dl className="grid h-full grid-cols-2 gap-3">
          {[
            ['My venues', data.venues.length, 'home'],
            ['Total bookings', data.totalBookings, 'calendar'],
            ['Upcoming bookings', data.upcoming.length, 'bed'],
            ['Average venue rating', data.averageRating ?? 'Not rated yet', 'star'],
          ].map(([label, value, icon]) => <div key={label} className="relative flex min-h-40 min-w-0 flex-col justify-end gap-2 rounded-lg bg-primary p-4 text-surface sm:min-h-44 sm:p-5">
            <Icon name={icon} className="absolute top-4 right-4 size-7 text-surface sm:size-8" />
            <dt className="order-2 text-small font-medium">{label}</dt><dd className={`order-1 pr-7 font-bold tracking-tight ${value === 'Not rated yet' ? 'text-lg' : 'text-4xl leading-none sm:text-5xl'}`}>{value}</dd>
          </div>)}
        </dl>}
      </div>
    </div>
    {data && <>
      <section className="account-section" aria-labelledby="manager-venues-heading">
        <SectionHeading id="manager-venues-heading" title="My venues" count={data.venues.length} to="/manager/venues" state={navigationOrigin(location)} />
        {data.venues.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.venues.slice(0, 3).map(venue => <VenueCard key={venue.id} venue={venue} />)}
        </div> : <p className="rounded-xl border border-border bg-surface p-5 text-muted">You haven’t listed any venues yet. Create your first venue to get started.</p>}
      </section>
      <section className="account-section" aria-labelledby="manager-bookings-heading">
        <SectionHeading id="manager-bookings-heading" title="Venue bookings" count={bookings.length} to="/manager/bookings" state={navigationOrigin(location)} />
        {bookings.length ? <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {bookings.slice(0, 3).map(booking => <li key={booking.id} className="min-w-0"><ManagerBookingCard booking={booking} /></li>)}
        </ul> : <p className="rounded-xl border border-border bg-surface p-5 text-muted">No current or upcoming bookings for your venues.</p>}
      </section>
    </>}
  </section>;
}
