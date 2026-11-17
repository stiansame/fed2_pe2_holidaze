import { messages } from "../constants/messages.js";
import { ApiError, getAllPages, isCreateOutcomeUncertain } from "./client.js";
import { clearVenueCache, getVenue } from "./venues.js";
import { staySummary } from "../utils/availability.js";
import { bookingStatus } from "../utils/bookings.js";

/**
 * Loads every booking page for a profile, including its venue data.
 * @param {Function} request Request function supplied by the API client or account provider.
 * @param {string} name Profile name.
 * @param {object} [options={}] Optional request settings.
 * @param {AbortSignal} [options.signal] Cancels an obsolete request.
 * @returns {Promise<object[]>}
 */
export function getProfileBookings(request, name, { signal } = {}) {
  return getAllPages(
    request,
    `holidaze/profiles/${encodeURIComponent(name)}/bookings`,
    {
      query: { _venue: true, sort: "dateFrom", sortOrder: "desc" },
      signal,
    },
  );
}

/**
 * Loads a booking and checks that its customer matches the signed-in account.
 * @param {Function} request Request function supplied by the API client or account provider.
 * @param {string} id Record ID.
 * @param {string} name Signed-in account name.
 * @param {object} [options={}] Optional request settings.
 * @param {AbortSignal} [options.signal] Cancels an obsolete request.
 * @returns {Promise<object>}
 * @throws {ApiError} If the booking belongs to another customer.
 */
export async function getOwnBooking(request, id, name, { signal } = {}) {
  const { data } = await request(
    `holidaze/bookings/${encodeURIComponent(id)}`,
    {
      query: { _venue: true, _customer: true },
      signal,
    },
  );
  if (data.customer?.name?.toLowerCase() !== name.toLowerCase())
    throw new ApiError(messages.bookingAccessDenied, 403);
  return data;
}

/**
 * Loads guest booking details only for the manager who owns the venue.
 * @param {Function} request Request function supplied by the API client or account provider.
 * @param {string} id Record ID.
 * @param {string} name Signed-in account name.
 * @param {object} [options={}] Optional request settings.
 * @param {AbortSignal} [options.signal] Cancels an obsolete request.
 * @returns {Promise<object>}
 * @throws {ApiError} If the account does not own the booked venue.
 */
export async function getVenueBooking(request, id, name, { signal } = {}) {
  const { data } = await request(
    `holidaze/bookings/${encodeURIComponent(id)}`,
    {
      query: { _venue: true, _customer: true },
      signal,
    },
  );
  if (!name || data?.venue?.owner?.name?.toLowerCase() !== name.toLowerCase()) {
    throw new ApiError(messages.managerBookingAccessDenied, 403);
  }
  return data;
}

/**
 * Checks customer ownership and rejects bookings whose stay has already started.
 * @param {Function} request Request function supplied by the API client or account provider.
 * @param {string} id Record ID.
 * @param {string} name Signed-in account name.
 * @returns {Promise<object>}
 */
async function getEditableBooking(request, id, name) {
  const booking = await getOwnBooking(request, id, name);
  if (bookingStatus(booking) !== "upcoming")
    throw new ApiError(messages.bookingNotEditable, 400);
  return booking;
}

/**
 * Rechecks an editable stay before saving; a changed price requires another review.
 * @param {Function} request Request function supplied by the API client or account provider.
 * @param {string} id Record ID.
 * @param {string} name Signed-in account name.
 * @param {object} stay Selected from/to dates in YYYY-MM-DD format and guest count.
 * @param {number} expectedPrice Nightly rate last reviewed by the customer.
 * @returns {Promise<{venue: object, booking: object|null}>}
 */
export async function updateBooking(request, id, name, stay, expectedPrice) {
  const original = await getEditableBooking(request, id, name);
  if (!original.venue?.id) throw new ApiError(messages.venueUnavailable, 404);
  const { data: venue } = await getVenue(original.venue.id);
  const summary = staySummary(venue, stay, id);
  if (summary.error) throw new ApiError(summary.error, 400);
  if (venue.price !== expectedPrice) return { venue, booking: null };
  clearVenueCache();
  const { data: booking } = await request(
    `holidaze/bookings/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: {
        dateFrom: `${stay.from}T00:00:00.000Z`,
        dateTo: `${stay.to}T00:00:00.000Z`,
        guests: stay.guests,
      },
    },
  );
  return { venue, booking };
}

/**
 * Checks ownership and future-stay eligibility before deleting a booking.
 * @param {Function} request Request function supplied by the API client or account provider.
 * @param {string} id Record ID.
 * @param {string} name Signed-in account name.
 * @returns {Promise<void>}
 */
export async function cancelBooking(request, id, name) {
  await getEditableBooking(request, id, name);
  clearVenueCache();
  await request(`holidaze/bookings/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/**
 * Rechecks availability and price before saving once; uncertain outcomes block blind retries.
 * @param {Function} request Request function supplied by the API client or account provider.
 * @param {string} venueId Venue being reserved.
 * @param {object} stay Selected from/to dates in YYYY-MM-DD format and guest count.
 * @param {number} expectedPrice Nightly rate last reviewed by the customer.
 * @returns {Promise<{venue: object, booking: object|null}>}
 */
export async function createBooking(request, venueId, stay, expectedPrice) {
  // Recheck immediately before POST; the API still decides whether the booking can be saved.
  const { data: venue } = await getVenue(venueId);
  const summary = staySummary(venue, stay);
  if (summary.error) throw new ApiError(summary.error);
  if (venue.price !== expectedPrice) return { venue, booking: null };
  clearVenueCache();
  try {
    const { data: booking } = await request("holidaze/bookings", {
      method: "POST",
      body: {
        venueId,
        dateFrom: `${stay.from}T00:00:00.000Z`,
        dateTo: `${stay.to}T00:00:00.000Z`,
        guests: stay.guests,
      },
    });
    if (!booking?.id) throw new ApiError(messages.missingBookingReference);
    return { venue, booking };
  } catch (error) {
    error.bookingUncertain = isCreateOutcomeUncertain(error.status);
    throw error;
  }
}
