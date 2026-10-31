import { dateKey, validDate } from './availability.js';

export function bookingDates(booking) {
  return { from: booking.dateFrom?.slice(0, 10) ?? '', to: booking.dateTo?.slice(0, 10) ?? '', guests: booking.guests };
}

export function bookingStatus(booking, today = dateKey()) {
  const { from, to } = bookingDates(booking);
  if (!validDate(from) || !validDate(to) || to <= from) return 'unknown';
  return to <= today ? 'past' : from <= today ? 'current' : 'upcoming';
}

export function bookingPrice(booking) {
  const { from, to } = bookingDates(booking);
  const price = booking.venue?.price;
  if (!validDate(from) || !validDate(to) || to <= from || !Number.isFinite(price) || price < 0) return null;
  const nights = (Date.parse(to) - Date.parse(from)) / 86400000;
  return { nights, total: Math.round(price * 100) * nights / 100 };
}

export function groupBookings(bookings, today = dateKey()) {
  const groups = { upcoming: [], past: [], unknown: [] };
  for (const booking of bookings) {
    const status = bookingStatus(booking, today);
    groups[status === 'current' ? 'upcoming' : status].push(booking);
  }
  groups.upcoming.sort((a, b) => a.dateFrom.localeCompare(b.dateFrom));
  groups.past.sort((a, b) => b.dateTo.localeCompare(a.dateTo));
  return groups;
}

export function formatBookingDate(value) {
  const date = value?.slice(0, 10);
  return validDate(date) ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : 'Date unavailable';
}
