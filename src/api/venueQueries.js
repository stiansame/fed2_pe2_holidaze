import { queryOptions } from "@tanstack/react-query";
import { getAllVenues } from "./venues.js";

/**
 * Caches each complete public venue list with its requested related data.
 * @param {object} [options={}] Related data needed by the view.
 * @param {boolean} [options.owner=false] Includes host names for search.
 * @param {boolean} [options.bookings=false] Includes booked dates for availability.
 * @returns {object} Shared query options for public venue lists.
 */
export function venueListOptions({ owner = false, bookings = false } = {}) {
  return queryOptions({
    queryKey: ["venueLists", { owner, bookings }],
    queryFn: ({ signal }) => getAllVenues({ owner, bookings, signal }),
    staleTime: 120_000,
    gcTime: 300_000,
  });
}
