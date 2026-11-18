import { useQuery } from "@tanstack/react-query";
import { getProfileVenues } from "../api/profiles.js";
import { queryKeys } from "../api/queryKeys.js";
import { useAuth } from "../auth/AuthContext.js";

/**
 * Reuses the manager's venue list across account pages for up to two minutes.
 * @template T
 * @param {(venues: object[]) => T} [select] Builds this view's data; omitted for the full list.
 * @returns {import('@tanstack/react-query').UseQueryResult<T>}
 */
export default function useManagerVenues(select) {
  const { user, request } = useAuth();
  return useQuery({
    queryKey: queryKeys.managerVenues(user.name),
    queryFn: ({ signal }) =>
      getProfileVenues(request, user.name, { bookings: true, signal }),
    select,
    staleTime: 120_000,
    gcTime: 300_000,
  });
}
