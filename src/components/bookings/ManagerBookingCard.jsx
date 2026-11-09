import { Link, useLocation } from 'react-router-dom';
import VenueImage from '../venues/VenueImage.jsx';
import BookingCardDetails from './BookingCardDetails.jsx';
import { navigationOrigin } from '../../utils/navigation.js';

export default function ManagerBookingCard({ booking }) {
  const location = useLocation();
  const venue = booking.venue;
  return <Link to={`/manager/bookings/${encodeURIComponent(booking.id)}${location.search}`} state={navigationOrigin(location)} className="block h-full min-w-0 overflow-hidden rounded-lg border border-border bg-surface shadow-sm transition-[translate,box-shadow] duration-200 hover:shadow-xl focus-within:shadow-xl motion-safe:hover:-translate-y-1 motion-safe:focus-within:-translate-y-1 motion-reduce:transition-none">
    <VenueImage key={venue.media?.[0]?.url} media={venue.media?.[0]} name={venue.name?.trim() || 'Unnamed stay'} className="relative aspect-video" imageClass="absolute inset-0 object-cover" />
    <div className="p-3"><BookingCardDetails booking={booking} showGuest /></div>
  </Link>;
}
