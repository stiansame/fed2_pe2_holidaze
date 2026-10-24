import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getVenue } from '../api/venues.js';
import Amenities from '../components/venues/Amenities.jsx';
import VenueGallery from '../components/venues/VenueGallery.jsx';
import { formatVenuePrice, venueMapLinks } from '../utils/venue.js';

export default function VenueDetails() {
  const { id } = useParams();
  return <VenueContent key={id} id={id} />;
}

function VenueContent({ id }) {
  const { search } = useLocation();
  const [venue, setVenue] = useState(null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
    const controller = new AbortController();
    getVenue(id, { signal: controller.signal }).then(result => {
      if (!controller.signal.aborted) setVenue(result.data);
    }).catch(error => {
      if (!controller.signal.aborted) setError(error);
    });
    return () => controller.abort();
  }, [id, attempt]);

  const name = venue?.name?.trim() || 'Unnamed stay';
  const notFound = error && [400, 404].includes(error.status);
  const map = venueMapLinks(venue?.location);
  const location = venue?.location;
  const address = [location?.address, location?.zip, location?.city, location?.country]
    .map(value => value?.trim()).filter(Boolean).join(', ');
  return (
    <section className="space-y-5 rounded-2xl border border-border bg-linear-to-br from-tint/60 via-surface to-background p-4 sm:p-6 lg:p-8">
      <title>{`Holidaze | ${notFound ? 'Venue not found' : venue ? name : 'Venue details'}`}</title>
      <Link to={`/venues${search}`} className="inline-flex min-h-12 items-center rounded-lg border border-border bg-surface px-4 font-semibold text-primary hover:bg-tint">← Back to venues</Link>
      {error ? <>
        <h1 className="text-h2 font-bold">{notFound ? 'Venue not found' : 'Unable to load this stay'}</h1>
        <p role="alert">{notFound ? 'This stay may have been removed or the link is incorrect.' : error.message}</p>
        {!notFound && <button type="button" onClick={() => { setError(null); setAttempt(value => value + 1); }} className="min-h-12 rounded-lg bg-primary px-4 font-semibold text-surface hover:bg-primary-hover">Try again</button>}
      </> : !venue ? <p role="status">Loading stay…</p> : <>
        <VenueGallery media={venue.media} name={name} />
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 space-y-6">
            <div className="space-y-3 border-b border-border pb-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="min-w-0 flex-1 text-h3 font-bold wrap-anywhere sm:text-h2">{name}</h1>
                <span className="rounded-full bg-tint px-3 py-2 text-small font-semibold text-primary">{venue.rating > 0 ? `★ ${venue.rating}` : 'New'}</span>
              </div>
              <p className="text-small text-muted wrap-anywhere">{[location?.city, location?.country].filter(Boolean).join(', ') || 'Location not specified'}</p>
            </div>
            <section className="space-y-3">
              <h2 className="text-body font-semibold text-primary">About this stay</h2>
              <p className="whitespace-pre-line text-muted wrap-anywhere">{venue.description?.trim() || 'No description provided.'}</p>
              <p className="inline-flex rounded-lg bg-tint px-3 py-2 text-small font-semibold text-primary">{venue.maxGuests > 0 ? `Up to ${venue.maxGuests} ${venue.maxGuests === 1 ? 'guest' : 'guests'}` : 'Guest capacity not specified'}</p>
            </section>
            <section className="space-y-3">
              <h2 className="text-h3 font-bold">Amenities</h2>
              {Object.values(venue.meta ?? {}).some(value => value === true) ? <Amenities meta={venue.meta} /> : <p className="text-muted">No amenities listed.</p>}
            </section>
            <section className="space-y-3 rounded-lg border-l-4 border-accent bg-accent/10 p-4">
              <h2 className="text-h3 font-bold">Hosted by</h2>
              <p className="font-semibold wrap-anywhere">{venue.owner?.name?.trim() || 'Host information not available.'}</p>
              {venue.owner?.bio?.trim() && <p className="whitespace-pre-line text-muted wrap-anywhere">{venue.owner.bio}</p>}
            </section>
            <section className="space-y-3 border-t border-border pt-5">
              <h2 className="text-h3 font-bold">Location</h2>
              <p className="text-muted wrap-anywhere">{address || 'Location not specified'}</p>
              {map && <div className="max-w-155 space-y-2">
                <iframe title={`Location of ${name}`} src={map.embed} loading="lazy" className="h-65 w-full rounded-lg border border-border" />
                <a href={map.full} target="_blank" rel="noopener noreferrer" className="inline-block py-2 text-small text-primary underline">View larger map · © OpenStreetMap contributors</a>
              </div>}
            </section>
          </div>
          <aside aria-label="Stay summary" className="overflow-hidden rounded-xl border border-border bg-surface lg:sticky lg:top-6">
            <div className="bg-primary p-6 text-surface">
              <p className="text-small font-semibold">Your stay</p>
              <p className="mt-2 text-h3 font-semibold">{formatVenuePrice(venue.price)}</p>
            </div>
            <dl className="space-y-4 p-6 text-small">
              <div><dt className="text-muted">Guests</dt><dd className="mt-1 font-semibold">{venue.maxGuests > 0 ? `Up to ${venue.maxGuests}` : 'Not specified'}</dd></div>
              <div><dt className="text-muted">Location</dt><dd className="mt-1 font-semibold wrap-anywhere">{[location?.city, location?.country].filter(Boolean).join(', ') || 'Not specified'}</dd></div>
              <div><dt className="text-muted">Host</dt><dd className="mt-1 font-semibold wrap-anywhere">{venue.owner?.name || 'Not specified'}</dd></div>
            </dl>
          </aside>
        </div>
      </>}
    </section>
  );
}
