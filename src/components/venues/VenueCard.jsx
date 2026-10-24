import Amenities from './Amenities.jsx';
import Icon from '../Icon.jsx';
import VenueImage from './VenueImage.jsx';
import { Link, useLocation } from 'react-router-dom';
import { formatVenuePrice } from '../../utils/venue.js';

export default function VenueCard({ venue }) {
  const { search } = useLocation();
  const name = venue.name?.trim() || 'Unnamed stay';
  const location = [venue.location?.city, venue.location?.country]
    .map(value => value?.trim()).filter(Boolean).join(', ') || 'Location not specified';
  return (
    <article className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface">
      <Link to={`/venues/${encodeURIComponent(venue.id)}${search}`} aria-label={`View ${name}`} className="block h-full hover:bg-background focus-visible:outline-offset-[-4px]">
      <VenueImage key={venue.media?.[0]?.url || 'missing'} media={venue.media?.[0]} name={name} />
      <div className="flex flex-col items-start gap-2 p-4">
        <h2 className="w-full text-h3 font-semibold wrap-anywhere">{name}</h2>
        <p className="flex w-full items-center gap-2 text-small text-muted wrap-anywhere"><Icon name="pin" className="size-4 shrink-0 text-success" />{location}</p>
        <p className="text-small font-semibold text-primary">{venue.rating > 0 ? <><span aria-hidden="true">★ </span><span className="sr-only">Rating: </span>{venue.rating}</> : 'New'}</p>
        <p className="flex items-center gap-2 text-small text-muted"><Icon name="user" className="size-4 shrink-0 text-success" />{venue.maxGuests > 0 ? `Up to ${venue.maxGuests} ${venue.maxGuests === 1 ? 'guest' : 'guests'}` : 'Guest capacity not specified'}</p>
        <Amenities meta={venue.meta} />
        <p className="text-small font-semibold">{formatVenuePrice(venue.price)}</p>
      </div>
      </Link>
    </article>
  );
}
