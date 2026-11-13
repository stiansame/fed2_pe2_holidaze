import { messages } from '../constants/messages.js';
import Loading from '../components/Loading.jsx';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { getHostProfile } from '../api/profiles.js';
import HostAvatar from '../components/HostAvatar.jsx';
import VenueImage from '../components/venues/VenueImage.jsx';
import VenueCard from '../components/venues/VenueCard.jsx';
import BackLink from '../components/BackLink.jsx';
import AccountStats from '../components/account/AccountStats.jsx';
import { guestSummary } from '../utils/bookings.js';

export default function PublicProfile() {
  const { name } = useParams();
  return <HostProfile key={name} name={name} />;
}

function HostProfile({ name }) {
  const { request } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
    const controller = new AbortController();
    getHostProfile(request, name, { signal: controller.signal }).then(result => {
      if (!controller.signal.aborted) setData(result);
    }).catch(error => { if (!controller.signal.aborted) setError(error); });
    return () => controller.abort();
  }, [request, name, attempt]);
  const notFound = error && [400, 404].includes(error.status);
  const profile = data?.profile;
  return <section className="space-y-5">
    <title>{`Holidaze | ${notFound ? messages.profileNotFound : name}`}</title>
    {!data && !error && <Loading>Loading host profile…</Loading>}
    {error && <div className="space-y-3">
      <h1 className="text-h3 font-bold">{notFound ? messages.profileNotFound : messages.profileLoadFailed}</h1>
      <p role="alert">{notFound ? messages.profileNotFoundDescription : error.message}</p>
      {!notFound && <button type="button" onClick={() => { setError(null); setAttempt(value => value + 1); }} className="h-11 rounded-lg border border-border bg-surface px-4 font-semibold text-primary">Try again</button>}
    </div>}
    {data && <div className="min-w-0 space-y-6">
      <div className="grid items-start gap-4 lg:items-stretch lg:grid-cols-2">
      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface">
        <VenueImage key={profile.banner?.url} media={profile.banner} name={`${profile.name}'s banner`} className="h-40 sm:h-48" loading="eager" />
        <div className="space-y-5 px-5 pb-6">
          <div className="relative flex flex-wrap items-start gap-4">
            <HostAvatar key={profile.avatar?.url} media={profile.avatar} className="-mt-12 size-28 border-4 border-surface bg-surface" />
            <div className="min-w-0 flex-1 pt-3">
              <h1 className="text-h3 font-bold wrap-anywhere">{profile.name}</h1>
              {profile.venueManager && <span className="mt-2 inline-flex h-8 items-center rounded-full bg-tint px-3 text-caption font-semibold text-primary">Venue manager</span>}
            </div>
          </div>
          <p className="whitespace-pre-line text-muted wrap-anywhere">{profile.bio?.trim() || 'No bio yet.'}</p>
        </div>
      </div>
      <AccountStats items={guestSummary(data.bookings)} />
      </div>
      {(profile.venueManager || data.venues.length > 0) && <section aria-label="Host venues" className="min-w-0 space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-h3 font-bold">Venues <span className="text-small font-normal text-muted">({data.venues.length})</span></h2>
          {data.venues.length > 3 && <button type="button" aria-expanded={expanded} onClick={() => setExpanded(value => !value)} className="h-11 rounded-lg px-2 font-semibold text-primary hover:bg-tint">{expanded ? 'Show less' : 'View all'} <span aria-hidden="true">→</span></button>}
        </div>
        {data.venues.length ? <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(expanded ? data.venues : data.venues.slice(0, 3)).map(venue => <li key={venue.id} className="min-w-0"><VenueCard venue={venue} /></li>)}
        </ul> : <p className="empty-state text-muted">No venues listed yet.</p>}
      </section>}
    </div>}
    <BackLink />
  </section>;
}
