import { useQuery } from "@tanstack/react-query";
import { getProfileVenues } from "../api/profiles.js";
import { managerVenuesKey } from "../api/queryClient.js";
import { useAuth } from "../auth/AuthContext.js";

/**
 * Reuses the manager's venue list across account pages for up to two minutes.
 * @template T
 * @param {(venues: object[]) => T} select Builds the data needed by this view.
 * @returns {import('@tanstack/react-query').UseQueryResult<T>}
 */
export default function useManagerVenues(select) {
  const { user, request } = useAuth();
  return useQuery({
    queryKey: managerVenuesKey(user.name),
    queryFn: ({ signal }) =>
      getProfileVenues(request, user.name, { bookings: true, signal }),
    select,
    staleTime: 120_000,
    gcTime: 300_000,
  });
}
