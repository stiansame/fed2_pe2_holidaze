import { formatPrice, formatVenuePrice } from '../../utils/venue.js';

export default function StaySummary({ venue, stay, summary }) {
  return <>
    <h2 className="text-h3 font-semibold wrap-anywhere">{venue.name?.trim() || 'Unnamed stay'}</h2>
    <dl className="grid grid-cols-2 gap-4">
      {[['Check-in', stay.from || 'Not selected'], ['Check-out', stay.to || 'Not selected'], ['Guests', stay.guests], ['Nights', summary.nights ?? '—'], ['Price per night', formatVenuePrice(venue.price)], ['Estimated total', summary.error ? '—' : formatPrice(summary.total)]].map(([label, value]) => <div key={label}><dt className="text-small text-muted">{label}</dt><dd className="font-semibold wrap-anywhere">{value}</dd></div>)}
    </dl>
  </>;
}
