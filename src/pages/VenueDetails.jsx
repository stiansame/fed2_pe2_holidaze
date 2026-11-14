import DocumentTitle from '../components/DocumentTitle.jsx';
import { messages } from '../constants/messages.js';
import Loading from '../components/Loading.jsx';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getVenue } from '../api/venues.js';
import { useAuth } from '../auth/AuthContext.js';
import Icon from '../components/Icon.jsx';
import BackLink from '../components/BackLink.jsx';
import { navigationOrigin } from '../utils/navigation.js';
import HostAvatar from '../components/HostAvatar.jsx';
import Amenities from '../components/venues/Amenities.jsx';
import Rating from '../components/venues/Rating.jsx';
import VenueGallery from '../components/venues/VenueGallery.jsx';
import VenueDescription from '../components/venues/VenueDescription.jsx';
import VenueBooking from '../components/venues/VenueBooking.jsx';
import VenueOwnerActions from '../components/venues/VenueOwnerActions.jsx';
import { venueMapLinks } from '../utils/venue.js';

const VenueLocationMap = lazy(() => import('../components/venues/VenueLocationMap.jsx'));

export default function VenueDetails() {
  const { id } = useParams();
  return <VenueContent key={id} id={id} />;
}

function VenueContent({ id }) {
  const routeLocation = useLocation();
  const { search } = routeLocation;
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
  const isOwner = user?.venueManager && user.name === venue?.owner?.name;
  const notFound = error && [400, 404].includes(error.status);
  const map = venueMapLinks(venue?.location);
  const location = venue?.location;
  const place = [location?.city, location?.country].map(value => value?.trim()).filter(Boolean).join(', ');
  const address = [location?.address, location?.zip, location?.city, location?.country]
    .map(value => value?.trim()).filter(Boolean).join(', ');
  const venueTitle = <h1 title={name} className="min-w-0 truncate text-body font-bold lg:text-h2 lg:whitespace-normal lg:wrap-anywhere">{name}</h1>;
  return (
    <section className="venue-details space-y-5 rounded-2xl border border-border bg-linear-to-br from-accent/10 via-surface to-tint/40 p-4 sm:p-6 lg:p-8">
      <DocumentTitle>{`Holidaze | ${notFound ? messages.venueNotFound : venue ? name : 'Venue details'}`}</DocumentTitle>
      <div className={venue && !error ? 'hidden lg:block' : 'block'}><BackLink to={`/venues${search}`} /></div>
      {error ? <>
        <h1 className="text-h2 font-bold">{notFound ? messages.venueNotFound : messages.venueLoadFailed}</h1>
        <p role="alert">{notFound ? messages.venueNotFoundDescription : error.message}</p>
        {!notFound && <button type="button" onClick={() => { setError(null); setAttempt(value => value + 1); }} className="h-11 rounded-lg bg-primary px-4 font-semibold text-surface hover:bg-primary-hover">Try again</button>}
      </> : !venue ? <Loading>Loading stay…</Loading> : <>
        <VenueGallery media={venue.media} name={name} backLink={<BackLink to={`/venues${search}`} iconOnly />}>
          {isOwner && <VenueOwnerActions venue={venue} />}
        </VenueGallery>
        <div className="grid items-start gap-x-8 lg:gap-y-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 space-y-6">
            <div className="space-y-3 border-b border-border pb-5">
              <div className="flex min-w-0 items-center gap-2 lg:items-start lg:gap-3">
                {venueTitle}<Rating rating={venue.rating} />
              </div>
              <div className="flex items-center gap-3 text-small">
                <p title={place} className="flex min-w-0 flex-1 items-center gap-1 text-muted lg:gap-2"><Icon name="pin" className="size-4 shrink-0 text-success lg:size-5" /><span className="truncate lg:whitespace-normal lg:wrap-anywhere">{place || 'Location not specified'}</span></p>
                <p className="accent-box ml-auto inline-flex shrink-0 items-center gap-1 text-caption lg:gap-2 lg:text-small"><Icon name="user" className="size-4 shrink-0 lg:size-5" />{venue.maxGuests > 0 ? `${venue.maxGuests} ${venue.maxGuests === 1 ? 'guest' : 'guests'}` : 'Capacity unknown'}</p>
              </div>
              <div>{Object.values(venue.meta ?? {}).some(value => value === true) ? <Amenities meta={venue.meta} compact /> : <p className="text-small text-muted">No amenities listed.</p>}</div>
            </div>
            <section className="space-y-3">
              <h2 className="text-body font-semibold text-primary">About this stay</h2>
              <VenueDescription description={venue.description} />
            </section>
            <section className="space-y-2 rounded-lg border-l-4 border-accent bg-accent/10 p-3 lg:p-4">
              <h2 className="flex min-w-0 items-center gap-2 text-small font-bold lg:text-body"><span className="shrink-0">Hosted by</span>{venue.owner?.name?.trim() && <Link title={venue.owner.name} to={`/profiles/${encodeURIComponent(venue.owner.name)}`} state={navigationOrigin(routeLocation)} className="min-w-0 truncate rounded text-primary hover:underline">{venue.owner.name}</Link>}</h2>
              <div className="flex items-start gap-3">
                {venue.owner?.name?.trim() && <Link aria-label={`View ${venue.owner.name}'s profile`} to={`/profiles/${encodeURIComponent(venue.owner.name)}`} state={navigationOrigin(routeLocation)} className="shrink-0 rounded-full"><HostAvatar key={venue.owner.avatar?.url} media={venue.owner.avatar} /></Link>}
                <p className="min-w-0 whitespace-pre-line text-small text-muted wrap-anywhere">{venue.owner?.name?.trim() ? venue.owner.bio?.trim() || 'No host bio provided.' : 'Host information not available.'}</p>
              </div>
            </section>
            <section className="space-y-3 border-t border-border pt-5">
              <h2 className="text-h3 font-bold">Location</h2>
              <p className="flex items-center gap-2 text-muted wrap-anywhere"><Icon name="pin" className="size-5 shrink-0 text-success" />{address || 'Location not specified'}</p>
              {map && <div className="max-w-155 space-y-2">
                <Suspense fallback={<Loading>Loading map…</Loading>}>
                  <VenueLocationMap lat={location.lat} lng={location.lng} compact />
                </Suspense>
                <a href={map.full} target="_blank" rel="noopener noreferrer" className="navigation-link text-small">View larger map · © OpenStreetMap contributors</a>
              </div>}
            </section>
          </div>
          <VenueBooking venue={venue} />
        </div>
      </>}
    </section>
  );
}
