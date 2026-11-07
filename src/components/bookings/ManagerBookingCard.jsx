import { Link, useLocation } from 'react-router-dom';
import { formatBookingDate } from '../../utils/bookings.js';
import VenueImage from '../venues/VenueImage.jsx';
import HostAvatar from '../HostAvatar.jsx';
import Icon from '../Icon.jsx';
import { navigationOrigin } from '../../utils/navigation.js';

const pillClass = 'inline-flex max-w-full items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-caption text-text shadow-sm';

export default function ManagerBookingCard({ booking }) {
  const location = useLocation();
  const { search } = location;
  const venue = booking.venue;
  const name = venue.name?.trim() || 'Unnamed stay';
  const address = [venue.location?.city, venue.location?.country]
    .map(value => value?.trim()).filter(Boolean).join(', ') || 'Location not specified';
  return <Link to={`/manager/bookings/${encodeURIComponent(booking.id)}${search}`} state={navigationOrigin(location)} className="relative block h-full min-w-0 overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-[translate,box-shadow] duration-200 hover:shadow-xl focus-within:shadow-xl motion-safe:hover:-translate-y-1 motion-safe:focus-within:-translate-y-1 motion-reduce:transition-none">
    <VenueImage key={venue.media?.[0]?.url} media={venue.media?.[0]} name={name} className="absolute inset-0" imageClass="object-cover" />
    <div className="relative flex min-h-60 min-w-0 flex-col justify-between gap-8 p-3">
      <div className="flex min-w-0 flex-col items-start gap-1.5">
        <h3 className={`${pillClass} font-semibold`}><span className="min-w-0 wrap-anywhere">{name}</span><Icon name="right" className="size-4 shrink-0" /></h3>
        <p className={`${pillClass} items-start`}><Icon name="pin" className="mt-0.5 size-4 shrink-0 text-success" /><span className="min-w-0 wrap-anywhere">{address}</span></p>
      </div>
      <div className="flex min-w-0 flex-col items-start gap-1.5">
        <p className={pillClass}><HostAvatar key={booking.customer?.avatar?.url} media={booking.customer?.avatar} className="size-6" /><span className="min-w-0 wrap-anywhere">{booking.customer?.name?.trim() || 'Guest name unavailable'}</span></p>
        <div className="flex min-w-0 max-w-full flex-wrap gap-1.5">
          <p className={pillClass}><Icon name="calendar" className="size-4 shrink-0" /><span className="min-w-0 wrap-anywhere">{formatBookingDate(booking.dateFrom).replace(/ \d{4}$/, '')} – {formatBookingDate(booking.dateTo).replace(/ \d{4}$/, '')}</span></p>
          <p className={pillClass}><Icon name="user" className="size-4 shrink-0" /><span className="min-w-0 wrap-anywhere">{Number.isInteger(booking.guests) && booking.guests > 0 ? `${booking.guests} ${booking.guests === 1 ? 'guest' : 'guests'}` : 'Guest count unavailable'}</span></p>
        </div>
      </div>
    </div>
  </Link>;
}
