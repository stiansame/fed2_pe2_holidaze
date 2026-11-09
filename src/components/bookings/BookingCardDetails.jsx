import { bookingPrice, formatBookingRange } from '../../utils/bookings.js';
import { formatPrice, formatVenuePrice } from '../../utils/venue.js';
import Icon from '../Icon.jsx';
import HostAvatar from '../HostAvatar.jsx';

export default function BookingCardDetails({ booking, title, showGuest = false }) {
  const venue = booking.venue;
  const place = [venue?.location?.city, venue?.location?.country]
    .map(value => value?.trim()).filter(Boolean).join(', ') || 'Location not specified';
  const price = bookingPrice(booking);
  return <div className="min-w-0 space-y-2 text-small">
    <h3 className="truncate font-semibold" title={venue?.name}>{title || venue?.name?.trim() || 'Venue unavailable'}</h3>
    <p title={place} className="flex min-w-0 items-center gap-2 text-muted"><Icon name="pin" className="size-4 shrink-0 text-success" /><span className="truncate">{place}</span></p>
    <p className="flex items-center gap-2 text-muted"><Icon name="calendar" className="size-4 shrink-0" />{formatBookingRange(booking)}</p>
    <div className="flex items-center justify-between gap-2">
      <p className="flex items-center gap-1"><Icon name="user" className="size-4 shrink-0" />{Number.isInteger(booking.guests) && booking.guests > 0 ? `${booking.guests} ${booking.guests === 1 ? 'guest' : 'guests'}` : 'Guests unavailable'}</p>
      <p className="flex items-center gap-1"><Icon name="moon" className="size-4 shrink-0" />{price ? `${price.nights} ${price.nights === 1 ? 'night' : 'nights'}` : 'Nights unavailable'}</p>
    </div>
    <div className="flex items-center justify-between gap-2 border-t border-border pt-2 text-caption">
      <p>{formatVenuePrice(venue?.price)}</p>
      <p className="text-right font-semibold">{price ? `${formatPrice(price.total)} total` : 'Total unavailable'}</p>
    </div>
    {showGuest && <p className="flex min-w-0 items-center gap-2 border-t border-border pt-2"><HostAvatar key={booking.customer?.avatar?.url} media={booking.customer?.avatar} className="size-7" /><span className="min-w-0 truncate">{booking.customer?.name?.trim() || 'Guest name unavailable'}</span></p>}
  </div>;
}
