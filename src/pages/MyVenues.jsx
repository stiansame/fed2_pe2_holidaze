import DocumentTitle from '../components/DocumentTitle.jsx';
import { messages } from '../constants/messages.js';
import Loading from '../components/Loading.jsx';
import SectionHeading from '../components/account/SectionHeading.jsx';
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
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    getProfileVenues(request, user.name, { signal: controller.signal }).then(data => {
      if (!controller.signal.aborted) setVenues(data);
    }).catch(error => { if (!controller.signal.aborted) setError(error.message); });
    return () => controller.abort();
  }, [request, user.name, attempt]);

  return <section className="min-w-0 space-y-6">
    <DocumentTitle>Holidaze | My venues</DocumentTitle>
    <div className="space-y-2">
      <SectionHeading level="h1" title="My venues" count={venues?.length} expanded={expanded} onToggle={venues?.length > 15 ? () => setExpanded(value => !value) : undefined}>
        <Link to="/manager/venues/new" state={navigationOrigin(location)} aria-label="Create venue" title="Create venue" className="navigation-link size-11 shrink-0 justify-center p-0"><Icon name="plus" /></Link>
      </SectionHeading>
      <p className="text-muted">Your listed places, newest first.</p>
    </div>
    <div className="account-section">
    {notice && <p role="status" className="text-success">{notice}</p>}
    {error ? <div role="alert" className="space-y-3">
      <p>{messages.ownVenuesLoadFailed} {error}</p>
      <button type="button" className="navigation-link" onClick={() => { setError(''); setAttempt(value => value + 1); }}>Try again</button>
    </div> : !venues ? <Loading>Loading your venues…</Loading> : venues.length ? <>
      <p role="status" className="text-small text-muted">Showing {expanded ? venues.length : Math.min(15, venues.length)} of {venues.length} venues.</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {(expanded ? venues : venues.slice(0, 15)).map(venue => <VenueCard key={venue.id} venue={venue} actions={<VenueOwnerActions card venue={venue} onDeleted={id => { setVenues(values => values.filter(item => item.id !== id)); setNotice(messages.venueDeleted); }} />} />)}
      </div>
    </> : <p className="empty-state rounded-xl border border-border bg-surface p-5 text-muted">You haven’t listed any venues yet. Create your first venue to get started.</p>}
    </div>
  </section>;
}
