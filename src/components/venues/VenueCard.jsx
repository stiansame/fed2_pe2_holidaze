import Amenities from './Amenities.jsx';
import VenueImage from './VenueImage.jsx';

const priceFormat = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 });

export default function VenueCard({ venue }) {
  const name = venue.name?.trim() || 'Unnamed stay';
  const location = [venue.location?.city, venue.location?.country]
    .map(value => value?.trim()).filter(Boolean).join(', ') || 'Location not specified';
  return (
    <article className="min-w-0 overflow-hidden rounded-lg border border-border bg-surface">
      <VenueImage key={venue.media?.[0]?.url || 'missing'} media={venue.media?.[0]} name={name} />
      <div className="flex flex-col items-start gap-2 p-4">
        <h2 className="w-full text-h3 font-semibold wrap-anywhere">{name}</h2>
        <p className="w-full text-small text-muted wrap-anywhere">{location}</p>
        <p className="text-small font-semibold text-primary">{venue.rating > 0 ? <><span aria-hidden="true">★ </span><span className="sr-only">Rating: </span>{venue.rating}</> : 'New'}</p>
        <p className="text-small text-muted">{venue.maxGuests > 0 ? `Up to ${venue.maxGuests} ${venue.maxGuests === 1 ? 'guest' : 'guests'}` : 'Guest capacity not specified'}</p>
        <Amenities meta={venue.meta} />
        <p className="text-small font-semibold">{Number.isFinite(venue.price) ? `NOK ${priceFormat.format(venue.price)} / night` : 'Price not specified'}</p>
      </div>
    </article>
  );
}
