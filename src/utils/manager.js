import { messages } from '../constants/messages.js';
import { bookingStatus, groupBookings } from './bookings.js';
import { dateKey } from './availability.js';

export function managerBookingGroups(venues, today = dateKey()) {
  // Missing booking data must never appear as a confirmed zero.
  if (venues.some(venue => !Array.isArray(venue.bookings))) throw new Error(messages.bookingInformationUnavailable);
  const bookings = [...new Map(venues.flatMap(venue => venue.bookings.map(booking => ({ ...booking, venue })))
    .map(booking => [booking.id, booking])).values()];
  const groups = groupBookings(bookings, today);
  return {
    upcoming: groups.upcoming.filter(booking => bookingStatus(booking, today) === 'upcoming'),
    current: groups.upcoming.filter(booking => bookingStatus(booking, today) === 'current'),
    past: groups.past,
    unknown: groups.unknown,
  };
}

export function managerSummary(venues, today = dateKey()) {
  const groups = managerBookingGroups(venues, today);
  const rated = venues.filter(venue => Number.isFinite(venue.rating) && venue.rating > 0 && venue.rating <= 5);
  return {
    totalBookings: Object.values(groups).reduce((sum, bookings) => sum + bookings.length, 0),
    upcoming: groups.upcoming,
    current: groups.current,
    averageRating: rated.length ? (rated.reduce((sum, venue) => sum + venue.rating, 0) / rated.length).toFixed(1) : null,
  };
}
