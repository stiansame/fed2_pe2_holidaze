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
    <article className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-[translate,box-shadow] duration-200 hover:shadow-xl focus-within:shadow-xl motion-safe:hover:-translate-y-1 motion-safe:focus-within:-translate-y-1 motion-reduce:transition-none">
      <Link to={`/venues/${encodeURIComponent(venue.id)}${search}`} aria-label={`View ${name}`} className="block h-full focus-visible:outline-offset-[-4px]">
      <div className="relative">
        <VenueImage key={venue.media?.[0]?.url || 'missing'} media={venue.media?.[0]} name={name} className="h-65 rounded-t-lg" />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-surface px-2.5 py-1.5 text-caption font-semibold text-text shadow-sm"><Icon name="user" className="size-4 shrink-0 text-primary" />{venue.maxGuests > 0 ? `Up to ${venue.maxGuests} ${venue.maxGuests === 1 ? 'guest' : 'guests'}` : 'Capacity not specified'}</span>
          <span className="shrink-0 rounded-full bg-surface px-2.5 py-1.5 text-caption font-semibold text-primary shadow-sm">{venue.rating > 0 ? <><span aria-hidden="true">★ </span><span className="sr-only">Rating: </span>{venue.rating}</> : 'New'}</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/45 to-transparent px-3 pt-8 pb-3">
          <Amenities meta={venue.meta} overlay />
        </div>
      </div>
      <div className="flex flex-col items-start gap-2 p-4">
        <h2 className="w-full text-h3 font-semibold wrap-anywhere">{name}</h2>
        <p className="flex w-full items-center gap-2 text-small text-muted wrap-anywhere"><Icon name="pin" className="size-4 shrink-0 text-success" />{location}</p>
        <p className="text-small font-semibold">{formatVenuePrice(venue.price)}</p>
      </div>
      </Link>
    </article>
  );
}
