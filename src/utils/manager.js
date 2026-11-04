import { bookingStatus } from './bookings.js';
import { dateKey } from './availability.js';

export function managerSummary(venues, today = dateKey()) {
  // Missing booking data must never appear as a confirmed zero.
  if (venues.some(venue => !Array.isArray(venue.bookings))) throw new Error('Booking information is unavailable. Please try again.');
  const bookings = [...new Map(venues.flatMap(venue => venue.bookings.map(booking => ({ ...booking, venue })))
    .map(booking => [booking.id, booking])).values()];
  const upcoming = bookings.filter(booking => bookingStatus(booking, today) === 'upcoming')
    .sort((a, b) => a.dateFrom.localeCompare(b.dateFrom));
  const rated = venues.filter(venue => Number.isFinite(venue.rating) && venue.rating > 0 && venue.rating <= 5);
  return {
    totalBookings: bookings.length,
    upcoming,
    averageRating: rated.length ? (rated.reduce((sum, venue) => sum + venue.rating, 0) / rated.length).toFixed(1) : null,
  };
}
