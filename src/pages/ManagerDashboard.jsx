import Loading from '../components/Loading.jsx';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { getProfileVenues } from '../api/profiles.js';
import { managerSummary } from '../utils/manager.js';
import ManagerBookingCard from '../components/bookings/ManagerBookingCard.jsx';
import VenueCard from '../components/venues/VenueCard.jsx';
import Icon from '../components/Icon.jsx';
import { navigationOrigin } from '../utils/navigation.js';

export default function ManagerDashboard() {
  const location = useLocation();
  const { user, request } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getProfileVenues(request, user.name, { bookings: true, signal: controller.signal }).then(venues => {
      const summary = managerSummary(venues);
      if (!controller.signal.aborted) setData({ venues, ...summary });
    }).catch(error => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [request, user.name, attempt]);

  return <section className="min-w-0 space-y-6">
    <title>Holidaze | Manager dashboard</title>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0 space-y-2">
        <h1 className="text-h3 font-bold wrap-anywhere sm:text-h2">Welcome back, {user.name}</h1>
        <p className="text-muted">Here’s an overview of your venues and bookings.</p>
      </div>
      <Link to="/manager/venues/new" state={navigationOrigin(location)} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-4 font-semibold text-surface hover:bg-primary-hover"><Icon name="plus" />Create venue</Link>
    </div>
    {error ? <div role="alert" className="space-y-3">
      <p>Unable to load your dashboard. {error}</p>
      <button type="button" className="navigation-link" onClick={() => { setError(''); setAttempt(value => value + 1); }}>Try again</button>
    </div> : !data ? <Loading>Loading your dashboard…</Loading> : <>
      <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          ['My venues', data.venues.length, 'home'],
          ['Total bookings', data.totalBookings, 'calendar'],
          ['Upcoming bookings', data.upcoming.length, 'calendar'],
          ['Average venue rating', data.averageRating ?? 'Not rated yet', 'star'],
        ].map(([label, value, icon]) => <div key={label} className="min-w-0 space-y-3 rounded-xl border border-border bg-surface p-4">
          <Icon name={icon} className="size-10 rounded-lg bg-accent/15 p-2 text-success" />
          <dt className="text-small text-muted">{label}</dt><dd className="text-h3 font-bold">{value}</dd>
        </div>)}
      </dl>
      <section className="space-y-4" aria-labelledby="manager-venues-heading">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="manager-venues-heading" className="text-h3 font-bold">My venues</h2>
          <Link to="/manager/venues" state={navigationOrigin(location)} className="navigation-link">View all venues<Icon name="right" /></Link>
        </div>
        {data.venues.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.venues.slice(0, 3).map(venue => <VenueCard key={venue.id} venue={venue} />)}
        </div> : <p className="rounded-xl border border-border bg-surface p-5 text-muted">You haven’t listed any venues yet. Create your first venue to get started.</p>}
      </section>
      {[
        ['current', 'Current stays', data.current],
        ['upcoming', 'Upcoming stays', data.upcoming],
      ].map(([status, title, bookings]) => <section key={status} className="space-y-4" aria-labelledby={`manager-${status}-heading`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id={`manager-${status}-heading`} className="text-h3 font-bold">{title}</h2>
          <Link to="/manager/bookings" state={navigationOrigin(location)} className="navigation-link">View all bookings<Icon name="right" /></Link>
        </div>
        {bookings.length ? <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {bookings.slice(0, 3).map(booking => <li key={booking.id} className="min-w-0"><ManagerBookingCard booking={booking} /></li>)}
        </ul> : <p className="rounded-xl border border-border bg-surface p-5 text-muted">No {title.toLowerCase()} for your venues.</p>}
      </section>)}
    </>}
  </section>;
}
