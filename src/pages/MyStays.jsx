import DocumentTitle from "../components/DocumentTitle.jsx";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../api/queryKeys.js";
import { useAuth } from "../auth/AuthContext.js";
import BookingsList from "../components/bookings/BookingsList.jsx";
import Icon from "../components/Icon.jsx";

/**
 * Provides the My stays heading, refresh action and shared customer booking list.
 * @returns {import('react').ReactNode}
 */
export default function MyStays() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return (
    <section className="space-y-6">
      <DocumentTitle>My stays | Holidaze</DocumentTitle>
      <div className="flex items-center gap-2">
        <h1 className="text-h3 font-bold sm:text-h2">My stays</h1>
        <button
          type="button"
          aria-label="Refresh stays"
          title="Refresh stays"
          onClick={() =>
            queryClient.refetchQueries({
              queryKey: queryKeys.profileBookings(user.name),
              exact: true,
            })
          }
          className="navigation-link size-11 shrink-0 justify-center p-0"
        >
          <Icon name="reset" />
        </button>
      </div>
      <BookingsList />
    </section>
  );
}
