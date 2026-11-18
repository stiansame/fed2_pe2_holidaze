import { queryOptions } from "@tanstack/react-query";
import { getAllVenues, getVenue } from "./venues.js";
import { queryKeys } from "./queryKeys.js";

/**
 * Shares the public venue read between details and reservation review.
 * @param {string} id Venue ID.
 * @returns {object} Query settings that forward request cancellation.
 */
export function venueOptions(id) {
  return queryOptions({
    queryKey: queryKeys.venue(id),
    queryFn: async ({ signal }) => {
      const { data } = await getVenue(id, { signal });
      return data;
    },
  });
}

/**
 * Caches each complete public venue list with its requested related data.
 * @param {object} [options={}] Related data needed by the view.
 * @param {boolean} [options.owner=false] Includes host names for search.
 * @param {boolean} [options.bookings=false] Includes booked dates for availability.
 * @returns {object} Shared query options for public venue lists.
 */
export function venueListOptions({ owner = false, bookings = false } = {}) {
  return queryOptions({
    queryKey: queryKeys.venueList({ owner, bookings }),
    queryFn: ({ signal }) => getAllVenues({ owner, bookings, signal }),
    staleTime: 120_000,
    gcTime: 300_000,
  });
}
