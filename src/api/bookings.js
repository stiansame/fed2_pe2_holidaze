import { ApiError } from './client.js';
import { getVenue } from './venues.js';
import { staySummary } from '../utils/availability.js';
import { bookingStatus } from '../utils/bookings.js';

export async function getOwnBookings(request, name, { signal } = {}) {
  const bookings = new Map();
  let page = 1;
  do {
    signal?.throwIfAborted();
    const { data, meta } = await request(`holidaze/profiles/${encodeURIComponent(name)}/bookings`, {
      query: { _venue: true, limit: 100, page, sort: 'dateFrom', sortOrder: 'desc' }, signal,
    });
    for (const booking of data) bookings.set(booking.id, booking);
    page = meta?.nextPage;
  } while (page);
  return [...bookings.values()];
}

export async function getOwnBooking(request, id, name, { signal } = {}) {
  const { data } = await request(`holidaze/bookings/${encodeURIComponent(id)}`, {
    query: { _venue: true, _customer: true }, signal,
  });
  if (data.customer?.name?.toLowerCase() !== name.toLowerCase()) throw new ApiError('This booking is not available for your account.', 403);
  return data;
}

async function getEditableBooking(request, id, name) {
  const booking = await getOwnBooking(request, id, name);
  if (bookingStatus(booking) !== 'upcoming') throw new ApiError('Only stays that have not started can be changed or cancelled.', 400);
  return booking;
}

export async function updateBooking(request, id, name, stay, expectedPrice) {
  const original = await getEditableBooking(request, id, name);
  if (!original.venue?.id) throw new ApiError('This venue is no longer available.', 404);
  const { data: venue } = await getVenue(original.venue.id);
  const summary = staySummary(venue, stay, id);
  if (summary.error) throw new ApiError(summary.error, 400);
  if (venue.price !== expectedPrice) return { venue, booking: null };
  const { data: booking } = await request(`holidaze/bookings/${encodeURIComponent(id)}`, {
    method: 'PUT', body: { dateFrom: `${stay.from}T00:00:00.000Z`, dateTo: `${stay.to}T00:00:00.000Z`, guests: stay.guests },
  });
  return { venue, booking };
}

export async function cancelBooking(request, id, name) {
  await getEditableBooking(request, id, name);
  await request(`holidaze/bookings/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function createBooking(request, venueId, stay, expectedPrice) {
  // Recheck immediately before POST; the API still decides whether the booking can be saved.
  const { data: venue } = await getVenue(venueId);
  const summary = staySummary(venue, stay);
  if (summary.error) throw new ApiError(summary.error);
  if (venue.price !== expectedPrice) return { venue, booking: null };
  try {
    const { data: booking } = await request('holidaze/bookings', {
      method: 'POST', body: {
        venueId, dateFrom: `${stay.from}T00:00:00.000Z`, dateTo: `${stay.to}T00:00:00.000Z`, guests: stay.guests,
      },
    });
    if (!booking?.id) throw new ApiError('The server did not return a booking reference.');
    return { venue, booking };
  } catch (error) {
    // A lost response may follow a saved booking. Do not invite an unsafe second POST.
    error.bookingUncertain = !error.status || error.status >= 500 || (error.status >= 200 && error.status < 300);
    throw error;
  }
}
