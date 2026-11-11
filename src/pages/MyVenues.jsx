import { messages } from '../constants/messages.js';
import Loading from '../components/Loading.jsx';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { getProfileVenues } from '../api/profiles.js';
import VenueCard from '../components/venues/VenueCard.jsx';
import Icon from '../components/Icon.jsx';
import VenueOwnerActions from '../components/venues/VenueOwnerActions.jsx';
import { navigationOrigin } from '../utils/navigation.js';

export default function MyVenues() {
  const { user, request } = useAuth();
  const location = useLocation();
  const { state } = location;
  const [notice, setNotice] = useState(state?.notice || '');
  const [venues, setVenues] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [count, setCount] = useState(15);

  useEffect(() => {
    const controller = new AbortController();
    getProfileVenues(request, user.name, { signal: controller.signal }).then(data => {
      if (!controller.signal.aborted) setVenues(data);
    }).catch(error => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [request, user.name, attempt]);

  return <section className="min-w-0 space-y-6">
    <title>Holidaze | My venues</title>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="space-y-2">
        <h1 className="text-h3 font-bold sm:text-h2">My venues</h1>
        <p className="text-muted">Your listed places, newest first.</p>
      </div>
      <Link to="/manager/venues/new" state={navigationOrigin(location)} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-4 font-semibold text-surface hover:bg-primary-hover"><Icon name="plus" />Create venue</Link>
    </div>
    {notice && <p role="status" className="text-success">{notice}</p>}
    {error ? <div role="alert" className="space-y-3">
      <p>{messages.ownVenuesLoadFailed} {error}</p>
      <button type="button" className="navigation-link" onClick={() => { setError(''); setAttempt(value => value + 1); }}>Try again</button>
    </div> : !venues ? <Loading>Loading your venues…</Loading> : venues.length ? <>
      <p role="status" className="text-small text-muted">Showing {Math.min(count, venues.length)} of {venues.length} venues.</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {venues.slice(0, count).map(venue => <VenueCard key={venue.id} venue={venue} actions={<VenueOwnerActions card venue={venue} onDeleted={id => { setVenues(values => values.filter(item => item.id !== id)); setNotice(messages.venueDeleted); }} />} />)}
      </div>
      {count < venues.length && <button type="button" className="navigation-link" onClick={() => setCount(value => value + 15)}>Load more</button>}
    </> : <p className="rounded-xl border border-border bg-surface p-5 text-muted">You haven’t listed any venues yet. Create your first venue to get started.</p>}
  </section>;
}
