import Loading from '../components/Loading.jsx';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getVenue } from '../api/venues.js';
import { useAuth } from '../auth/AuthContext.js';
import Icon from '../components/Icon.jsx';
import HostAvatar from '../components/HostAvatar.jsx';
import Amenities from '../components/venues/Amenities.jsx';
import VenueGallery from '../components/venues/VenueGallery.jsx';
import VenueDescription from '../components/venues/VenueDescription.jsx';
import AvailabilityCalendar from '../components/venues/AvailabilityCalendar.jsx';
import { formatVenuePrice, venueMapLinks } from '../utils/venue.js';

const VenueLocationMap = lazy(() => import('../components/venues/VenueLocationMap.jsx'));

export default function VenueDetails() {
  const { id } = useParams();
  return <VenueContent key={id} id={id} />;
}

function VenueContent({ id }) {
  const { search, state } = useLocation();
  const { user } = useAuth();
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
  const place = [location?.city, location?.country].map(value => value?.trim()).filter(Boolean).join(', ');
  const address = [location?.address, location?.zip, location?.city, location?.country]
    .map(value => value?.trim()).filter(Boolean).join(', ');
  return (
    <section className="space-y-5 rounded-2xl border border-border bg-linear-to-br from-accent/10 via-surface to-tint/40 p-4 sm:p-6 lg:p-8">
      <title>{`Holidaze | ${notFound ? 'Venue not found' : venue ? name : 'Venue details'}`}</title>
      <div className="flex flex-wrap gap-3">
        <Link to={`/venues${search}`} className="navigation-link">← Back to venues</Link>
        {user?.venueManager && state?.fromMyVenues && <Link to="/manager/venues" className="navigation-link">← Back to my venues</Link>}
      </div>
      {error ? <>
        <h1 className="text-h2 font-bold">{notFound ? 'Venue not found' : 'Unable to load this stay'}</h1>
        <p role="alert">{notFound ? 'This stay may have been removed or the link is incorrect.' : error.message}</p>
        {!notFound && <button type="button" onClick={() => { setError(null); setAttempt(value => value + 1); }} className="min-h-12 rounded-lg bg-primary px-4 font-semibold text-surface hover:bg-primary-hover">Try again</button>}
      </> : !venue ? <Loading>Loading stay…</Loading> : <>
        <VenueGallery media={venue.media} name={name}>
          {user?.venueManager && user.name === venue.owner?.name && <Link to={`/manager/venues/${encodeURIComponent(venue.id)}/edit`} className="navigation-link w-full gap-2 sm:w-auto"><Icon name="edit" />Edit venue</Link>}
        </VenueGallery>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 space-y-6">
            <div className="space-y-3 border-b border-border pb-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="min-w-0 flex-1 text-h3 font-bold wrap-anywhere sm:text-h2">{name}</h1>
                <span className="rounded-full bg-tint px-3 py-2 text-small font-semibold text-primary">{venue.rating > 0 ? `★ ${venue.rating}` : 'New'}</span>
              </div>
              <p className="flex items-center gap-2 text-small text-muted wrap-anywhere"><Icon name="pin" className="size-5 shrink-0 text-success" />{place || 'Location not specified'}</p>
            </div>
            <section className="space-y-3">
              <h2 className="text-body font-semibold text-primary">About this stay</h2>
              <VenueDescription description={venue.description} />
              <p className="inline-flex items-center gap-2 rounded-lg bg-accent/20 px-3 py-2 text-small font-semibold text-text"><Icon name="user" />{venue.maxGuests > 0 ? `Up to ${venue.maxGuests} ${venue.maxGuests === 1 ? 'guest' : 'guests'}` : 'Guest capacity not specified'}</p>
            </section>
            <section className="space-y-3">
              <h2 className="text-h3 font-bold">Amenities</h2>
              {Object.values(venue.meta ?? {}).some(value => value === true) ? <Amenities meta={venue.meta} /> : <p className="text-muted">No amenities listed.</p>}
            </section>
            <section className="space-y-3 rounded-lg border-l-4 border-accent bg-accent/10 p-4">
              <h2 className="text-h3 font-bold">Hosted by</h2>
              {venue.owner?.name?.trim() ? <Link to={`/profiles/${encodeURIComponent(venue.owner.name)}`} className="inline-flex min-h-12 items-center gap-3 rounded-lg font-semibold text-primary wrap-anywhere hover:underline"><HostAvatar key={venue.owner.avatar?.url} media={venue.owner.avatar} />{venue.owner.name}</Link>
                : <p className="text-muted">Host information not available.</p>}
              <p className="whitespace-pre-line text-muted wrap-anywhere">{venue.owner?.bio?.trim() || 'No host bio provided.'}</p>
            </section>
            <section className="space-y-3 border-t border-border pt-5">
              <h2 className="text-h3 font-bold">Location</h2>
              <p className="flex items-center gap-2 text-muted wrap-anywhere"><Icon name="pin" className="size-5 shrink-0 text-success" />{address || 'Location not specified'}</p>
              {map && <div className="max-w-155 space-y-2">
                <Suspense fallback={<Loading>Loading map…</Loading>}>
                  <VenueLocationMap lat={location.lat} lng={location.lng} />
                </Suspense>
                <a href={map.full} target="_blank" rel="noopener noreferrer" className="inline-block py-2 text-small text-primary underline">View larger map · © OpenStreetMap contributors</a>
              </div>}
            </section>
          </div>
          <aside aria-label="Stay summary" className="overflow-hidden rounded-xl border border-border bg-surface lg:sticky lg:top-6">
            <div className="bg-primary p-6 text-surface">
              <p className="text-small font-semibold">Your stay</p>
              <p className="mt-2 text-h3 font-semibold">{formatVenuePrice(venue.price)}</p>
            </div>
            <AvailabilityCalendar bookings={venue.bookings} maxGuests={venue.maxGuests} />
          </aside>
        </div>
      </>}
    </section>
  );
}
