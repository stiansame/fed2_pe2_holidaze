import { messages } from '../constants/messages.js';
import { ApiError, getAllPages } from './client.js';
import { clearVenueCache, getVenue } from './venues.js';
import { staySummary } from '../utils/availability.js';
import { bookingStatus } from '../utils/bookings.js';

export function getOwnBookings(request, name, { signal } = {}) {
  return getAllPages(request, `holidaze/profiles/${encodeURIComponent(name)}/bookings`, {
    query: { _venue: true, sort: 'dateFrom', sortOrder: 'desc' }, signal,
  });
}

export async function getOwnBooking(request, id, name, { signal } = {}) {
  const { data } = await request(`holidaze/bookings/${encodeURIComponent(id)}`, {
    query: { _venue: true, _customer: true }, signal,
  });
  if (data.customer?.name?.toLowerCase() !== name.toLowerCase()) throw new ApiError(messages.bookingAccessDenied, 403);
  return data;
}

export async function getVenueBooking(request, id, name, { signal } = {}) {
  const { data } = await request(`holidaze/bookings/${encodeURIComponent(id)}`, {
    query: { _venue: true, _customer: true }, signal,
  });
  if (!name || data?.venue?.owner?.name?.toLowerCase() !== name.toLowerCase()) {
    throw new ApiError(messages.managerBookingAccessDenied, 403);
  }
  return data;
}

async function getEditableBooking(request, id, name) {
  const booking = await getOwnBooking(request, id, name);
  if (bookingStatus(booking) !== 'upcoming') throw new ApiError(messages.bookingNotEditable, 400);
  return booking;
}

export async function updateBooking(request, id, name, stay, expectedPrice) {
  const original = await getEditableBooking(request, id, name);
  if (!original.venue?.id) throw new ApiError(messages.venueUnavailable, 404);
  const { data: venue } = await getVenue(original.venue.id);
  const summary = staySummary(venue, stay, id);
  if (summary.error) throw new ApiError(summary.error, 400);
  if (venue.price !== expectedPrice) return { venue, booking: null };
  clearVenueCache();
  const { data: booking } = await request(`holidaze/bookings/${encodeURIComponent(id)}`, {
    method: 'PUT', body: { dateFrom: `${stay.from}T00:00:00.000Z`, dateTo: `${stay.to}T00:00:00.000Z`, guests: stay.guests },
  });
  return { venue, booking };
}

export async function cancelBooking(request, id, name) {
  await getEditableBooking(request, id, name);
  clearVenueCache();
  await request(`holidaze/bookings/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function createBooking(request, venueId, stay, expectedPrice) {
  // Recheck immediately before POST; the API still decides whether the booking can be saved.
  const { data: venue } = await getVenue(venueId);
  const summary = staySummary(venue, stay);
  if (summary.error) throw new ApiError(summary.error);
  if (venue.price !== expectedPrice) return { venue, booking: null };
  clearVenueCache();
  try {
    const { data: booking } = await request('holidaze/bookings', {
      method: 'POST', body: {
        venueId, dateFrom: `${stay.from}T00:00:00.000Z`, dateTo: `${stay.to}T00:00:00.000Z`, guests: stay.guests,
      },
    });
    if (!booking?.id) throw new ApiError(messages.missingBookingReference);
    return { venue, booking };
  } catch (error) {
    // A lost response may follow a saved booking. Do not invite an unsafe second POST.
    error.bookingUncertain = !error.status || error.status >= 500 || (error.status >= 200 && error.status < 300);
    throw error;
  }
}
