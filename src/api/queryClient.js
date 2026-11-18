import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      networkMode: "always",
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      gcTime: 0,
    },
  },
});

/**
 * Identifies one manager's venues and bookings in the query cache.
 * @param {string} name Manager's profile name.
 * @returns {string[]} Account-specific query key.
 */
export const managerVenuesKey = (name) => ["managerVenues", name];

/**
 * Cancels obsolete venue-list reads and marks lists stale after any write outcome.
 * @returns {Promise<void>}
 */
export async function invalidateVenueQueries() {
  const filter = {
    predicate: (query) =>
      [
        "venueLists",
        "managerVenues",
        "myVenues",
        "profileBookings",
        "hostProfile",
      ].includes(query.queryKey[0]),
  };
  await queryClient.cancelQueries(filter);
  void queryClient.invalidateQueries(filter);
}
