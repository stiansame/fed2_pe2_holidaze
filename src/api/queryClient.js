import { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys.js";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      networkMode: "always",
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      // Reopen details and account views with fresh data; list queries opt into caching.
      gcTime: 0,
    },
  },
});

/**
 * Cancels obsolete venue-list reads and marks lists stale after any write outcome.
 * @returns {Promise<void>}
 */
export async function invalidateVenueQueries() {
  const filters = [
    queryKeys.venueLists,
    queryKeys.bookingLists,
    queryKeys.hostProfiles,
  ].map((queryKey) => ({ queryKey }));
  await Promise.all(filters.map((filter) => queryClient.cancelQueries(filter)));
  void Promise.all(filters.map((filter) => queryClient.invalidateQueries(filter)));
}
