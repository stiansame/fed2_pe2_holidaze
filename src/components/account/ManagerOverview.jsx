import Loading from '../Loading.jsx';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.js';
import { getProfileVenues } from '../../api/profiles.js';
import { managerSummary } from '../../utils/manager.js';
import ManagerBookingCard from '../bookings/ManagerBookingCard.jsx';
import VenueCard from '../venues/VenueCard.jsx';
import AccountStats from './AccountStats.jsx';
import SectionHeading from './SectionHeading.jsx';
import { navigationOrigin } from '../../utils/navigation.js';

export default function ManagerOverview({ children, stats }) {
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
    <div className="grid items-start gap-4 lg:items-stretch lg:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)]">
      {children}
      <div className="min-w-0 self-stretch">
        {error ? <div role="alert" className="space-y-3">
          <p>Unable to load your venue overview. {error}</p>
          <button type="button" className="navigation-link" onClick={() => { setError(''); setAttempt(value => value + 1); }}>Try again</button>
        </div> : !data ? <Loading>Loading your venue overview…</Loading> : <AccountStats items={[
          ['My venues', data.venues.length, 'home'],
          ['Total bookings', data.totalBookings, 'calendar'],
          ['Upcoming bookings', data.upcoming.length, 'bed'],
          ['Average venue rating', data.averageRating ?? 'Not rated yet', 'star'],
          ...stats,
        ]} />}
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
