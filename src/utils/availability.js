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
  if (!Number.isFinite(venue.price) || venue.price < 0) return { error: 'A valid price is unavailable for this stay.' };
  const nights = (Date.parse(stay.to) - Date.parse(stay.from)) / 86400000;
  return { error: '', nights, total: Math.round(venue.price * 100) * nights / 100 };
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
  if (periods === null) return 'Availability is unavailable. Please try again later.';
  if (!validDate(from) || !validDate(to)) return 'Choose a valid check-in and check-out date.';
  if (from < today) return 'Check-in cannot be in the past.';
  if (to <= from) return 'Check-out must be after check-in (at least one night).';
  if (!Number.isInteger(guests) || guests < 1 || !Number.isInteger(maxGuests) || guests > maxGuests) return 'Choose a guest count within this stay’s capacity.';
  if (overlaps(from, to, periods)) return 'These dates overlap an existing booking. Choose another stay.';
  return '';
}
