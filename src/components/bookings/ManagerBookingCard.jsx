import { Link, useLocation } from 'react-router-dom';
import VenueImage from '../venues/VenueImage.jsx';
import HostAvatar from '../HostAvatar.jsx';
import Icon from '../Icon.jsx';
import { bookingPrice, bookingStatus, formatBookingRange } from '../../utils/bookings.js';
import { formatPrice } from '../../utils/venue.js';
import { navigationOrigin } from '../../utils/navigation.js';

const pillClass = 'inline-flex max-w-full items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-caption text-text shadow-sm';

export default function ManagerBookingCard({ booking }) {
  const location = useLocation();
  const venue = booking.venue;
  const name = venue.name?.trim() || 'Venue unavailable';
  const place = [venue.location?.city, venue.location?.country].map(value => value?.trim()).filter(Boolean).join(', ') || 'Location not specified';
  const price = bookingPrice(booking);
  return <Link to={`/manager/bookings/${encodeURIComponent(booking.id)}${location.search}`} state={navigationOrigin(location)} className="relative block h-full min-w-0 overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-[translate,box-shadow] duration-200 hover:shadow-xl focus-within:shadow-xl motion-safe:hover:-translate-y-1 motion-safe:focus-within:-translate-y-1 motion-reduce:transition-none">
    <VenueImage key={venue.media?.[0]?.url} media={venue.media?.[0]} name={name} className="absolute inset-0" imageClass={`object-cover ${bookingStatus(booking) === 'past' ? 'saturate-25' : ''}`} />
    <div className="relative flex min-h-72 min-w-0 flex-col justify-between gap-8 bg-linear-to-t from-black/50 via-transparent to-transparent p-3">
      <div className="flex min-w-0 flex-col items-start gap-1.5">
        <h3 title={name} className={`${pillClass} font-semibold`}><span className="truncate">{name}</span></h3>
        <p title={place} className={pillClass}><Icon name="pin" className="size-4 shrink-0 text-success" /><span className="truncate">{place}</span></p>
      </div>
      <div className="flex min-w-0 flex-col items-start gap-1.5">
        <p className={pillClass}><HostAvatar key={booking.customer?.avatar?.url} media={booking.customer?.avatar} className="size-6" /><span className="min-w-0 truncate">{booking.customer?.name?.trim() || 'Guest name unavailable'}</span></p>
        <div className="flex max-w-full flex-wrap gap-1.5">
          <p className={pillClass}><Icon name="calendar" className="size-4 shrink-0" />{formatBookingRange(booking)}</p>
          <p className={pillClass}><Icon name="user" className="size-4 shrink-0" />{Number.isInteger(booking.guests) && booking.guests > 0 ? `${booking.guests} ${booking.guests === 1 ? 'guest' : 'guests'}` : 'Guests unavailable'}</p>
          <p className={pillClass}><Icon name="moon" className="size-4 shrink-0" />{price ? `${price.nights} ${price.nights === 1 ? 'night' : 'nights'}` : 'Nights unavailable'}</p>
          <p className={`${pillClass} font-semibold`}>{price ? `${formatPrice(price.total)} total` : 'Total unavailable'}</p>
        </div>
      </div>
    </div>
  </Link>;
}
