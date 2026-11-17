import { getProfileBookings } from "./bookings.js";
import { getAllPages } from "./client.js";

/**
 * Loads a profile, then fetches its venues and bookings in parallel for public statistics.
 * @param {Function} request Request function supplied by the API client or account provider.
 * @param {string} name Profile name.
 * @param {object} [options={}] Optional request settings.
 * @param {AbortSignal} [options.signal] Cancels an obsolete request.
 * @returns {Promise<{profile: object, venues: object[], bookings: object[]}>}
 */
export async function getHostProfile(request, name, { signal } = {}) {
  const path = `holidaze/profiles/${encodeURIComponent(name)}`;
  const { data: profile } = await request(path, { signal });
  const [venues, bookings] = await Promise.all([
    getProfileVenues(request, name, { signal }),
    getProfileBookings(request, name, { signal }),
  ]);
  return { profile, venues, bookings };
}

/**
 * Loads every venue for a profile, newest first, optionally including bookings.
 * @param {Function} request Request function supplied by the API client or account provider.
 * @param {string} name Profile name.
 * @param {object} [options={}] Related data and cancellation settings.
 * @param {boolean} [options.bookings=false] Includes venue bookings.
 * @param {AbortSignal} [options.signal] Cancels the load.
 * @returns {Promise<object[]>}
 */
export function getProfileVenues(
  request,
  name,
  { bookings = false, signal } = {},
) {
  return getAllPages(
    request,
    `holidaze/profiles/${encodeURIComponent(name)}/venues`,
    {
      query: {
        sort: "created",
        sortOrder: "desc",
        ...(bookings && { _bookings: true }),
      },
      signal,
    },
  );
}
