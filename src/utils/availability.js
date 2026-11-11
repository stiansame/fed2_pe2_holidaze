import { messages } from '../constants/messages.js';
// Keep calendar dates as YYYY-MM-DD; UTC arithmetic avoids daylight-saving shifts.
export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function addDays(date, days) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function validDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date))
    && new Date(date).toISOString().slice(0, 10) === date;
}

export function stayFromSearch(search) {
  const params = new URLSearchParams(search);
  return {
    from: validDate(params.get('from')) ? params.get('from') : '',
    to: validDate(params.get('to')) ? params.get('to') : '',
    guests: params.has('guests') ? Number(params.get('guests')) : 1,
  };
}

export function staySummary(venue, stay, bookingId) {
  const { periods, reliable } = bookedPeriods(bookingId ? venue.bookings?.filter(booking => booking.id !== bookingId) : venue.bookings);
  const error = validateStay({ ...stay, maxGuests: venue.maxGuests, periods: reliable ? periods : null });
  if (error) return { error };
  const price = stayPrice(venue.price, stay.from, stay.to);
  return price ? { error: '', ...price } : { error: messages.invalidStayPrice };
}

export function stayPrice(price, from, to) {
  if (!validDate(from) || !validDate(to) || to <= from || !Number.isFinite(price) || price < 0) return null;
  const nights = (Date.parse(to) - Date.parse(from)) / 86400000;
  return { nights, total: Math.round(price * 100) * nights / 100 };
}

export function bookedPeriods(bookings, today = dateKey()) {
  if (!Array.isArray(bookings)) return { periods: null, reliable: false };
  const periods = bookings.map(booking => [booking?.dateFrom, booking?.dateTo].map(value => typeof value === 'string' ? value.slice(0, 10) : ''));
  // Legacy bookings can have reversed or equal dates. Ignore them only when both dates are past.
  const upcoming = periods.filter(([from, to]) => !(validDate(from) && validDate(to) && from < today && to < today));
  const valid = upcoming.filter(([from, to]) => validDate(from) && validDate(to) && from < to);
  return { periods: valid, reliable: valid.length === upcoming.length };
}

// Checkout is exclusive: a new stay may start on the previous stay's checkout date.
export function overlaps(from, to, periods) {
  return periods.some(([start, end]) => from < end && to > start);
}

export function validateStay({ from, to, guests, maxGuests, periods, today = dateKey() }) {
  if (periods === null) return messages.availabilityUnavailable;
  if (!validDate(from) || !validDate(to)) return messages.invalidStayDates;
  if (from < today) return messages.pastCheckIn;
  if (to <= from) return messages.invalidCheckOut;
  if (!Number.isInteger(guests) || guests < 1 || !Number.isInteger(maxGuests) || guests > maxGuests) return messages.invalidStayGuests;
  if (overlaps(from, to, periods)) return messages.overlappingStay;
  return '';
}
