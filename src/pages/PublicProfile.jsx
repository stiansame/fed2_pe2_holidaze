import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { getHostProfile } from '../api/profiles.js';
import HostAvatar from '../components/HostAvatar.jsx';
import VenueImage from '../components/venues/VenueImage.jsx';
import Icon from '../components/Icon.jsx';
import { formatVenuePrice } from '../utils/venue.js';

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
    <title>{`Holidaze | ${notFound ? 'Profile not found' : name}`}</title>
    {!data && !error && <p role="status">Loading host profile…</p>}
    {error && <div className="space-y-3">
      <h1 className="text-h3 font-bold">{notFound ? 'Profile not found' : 'Unable to load host profile'}</h1>
      <p role="alert">{notFound ? 'This profile may have been removed or the link is incorrect.' : error.message}</p>
      {!notFound && <button type="button" onClick={() => { setError(null); setAttempt(value => value + 1); }} className="min-h-12 rounded-lg border border-border bg-surface px-4 font-semibold text-primary">Try again</button>}
    </div>}
    {data && <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface">
        <VenueImage key={profile.banner?.url} media={profile.banner} name={`${profile.name}'s banner`} className="h-40 sm:h-48" loading="eager" />
        <div className="space-y-5 px-5 pb-6">
          <div className="relative flex flex-wrap items-start gap-4">
            <HostAvatar key={profile.avatar?.url} media={profile.avatar} className="-mt-12 size-28 border-4 border-surface bg-surface" />
            <div className="min-w-0 flex-1 pt-3">
              <h1 className="text-h3 font-bold wrap-anywhere">{profile.name}</h1>
              {profile.venueManager && <span className="mt-2 inline-block rounded-full bg-tint px-3 py-1 text-caption font-semibold text-primary">Venue manager</span>}
            </div>
          </div>
          <p className="whitespace-pre-line text-muted wrap-anywhere">{profile.bio?.trim() || 'No bio yet.'}</p>
        </div>
      </div>
      <section aria-label="Host venues" className="min-w-0 space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-h3 font-bold">Venues <span className="text-small font-normal text-muted">({data.venues.length})</span></h2>
          {data.venues.length > 3 && <button type="button" aria-expanded={expanded} onClick={() => setExpanded(value => !value)} className="min-h-12 rounded-lg px-2 font-semibold text-primary hover:bg-tint">{expanded ? 'Show less' : 'View all'} <span aria-hidden="true">→</span></button>}
        </div>
        {data.venues.length ? <ul className="space-y-3">
          {(expanded ? data.venues : data.venues.slice(0, 3)).map(venue => {
            const title = venue.name?.trim() || 'Unnamed stay';
            const place = [venue.location?.city, venue.location?.country].map(value => value?.trim()).filter(Boolean).join(', ') || 'Location not specified';
            return <li key={venue.id}><Link to={`/venues/${encodeURIComponent(venue.id)}`} className="flex min-w-0 items-stretch overflow-hidden rounded-lg border border-border transition-shadow hover:shadow-md focus-visible:outline-offset-2">
              <VenueImage key={venue.media?.[0]?.url} media={venue.media?.[0]} name={title} className="relative w-24 shrink-0" imageClass="absolute inset-0 object-cover" />
              <div className="min-w-0 flex-1 space-y-1 p-3">
                <h3 className="font-semibold text-primary wrap-anywhere">{title}</h3>
                <p className="flex items-start gap-1 text-small text-muted wrap-anywhere"><Icon name="pin" className="size-4 shrink-0 text-success" />{place}</p>
                <p className="text-small font-semibold">{formatVenuePrice(venue.price)}</p>
              </div>
              <span aria-hidden="true" className="flex items-center pr-3 text-primary">›</span>
            </Link></li>;
          })}
        </ul> : <p className="text-muted">No venues listed yet.</p>}
      </section>
    </div>}
    <Link to="/venues" className="navigation-link">Explore venues</Link>
  </section>;
}
