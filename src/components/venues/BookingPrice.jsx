import { formatPrice, formatVenuePrice } from '../../utils/venue.js';
import { formatBookingRange } from '../../utils/bookings.js';

export default function BookingPrice({ price, stay, summary }) {
  const range = formatBookingRange({ dateFrom: stay.from, dateTo: stay.to });
  return <div className="min-w-0 text-small" aria-live="polite">
    <p className="font-bold">{summary.error ? formatVenuePrice(price) : `${formatPrice(summary.total)} total`}</p>
    {!summary.error && <p className="text-caption text-muted">{range.replace(` ${new Date().getFullYear()}`, '')} · {summary.nights} {summary.nights === 1 ? 'night' : 'nights'}</p>}
  </div>;
}
