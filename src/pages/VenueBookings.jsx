import DocumentTitle from "../components/DocumentTitle.jsx";
import { messages } from "../constants/messages.js";
import { useCallback } from "react";
import useAsync from "../hooks/useAsync.js";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.js";
import { getProfileVenues } from "../api/profiles.js";
import { managerBookingGroups } from "../utils/manager.js";
import ManagerBookingCard from "../components/bookings/ManagerBookingCard.jsx";
import Loading from "../components/Loading.jsx";
import BookingGroup from "../components/bookings/BookingGroup.jsx";
import Icon from "../components/Icon.jsx";

/**
 * Loads owned-venue bookings and groups current, upcoming and past stays.
 * @returns {import('react').ReactNode}
 */
export default function VenueBookings() {
  const { user, request } = useAuth();
  const [params, setParams] = useSearchParams();
  const venueId = params.get("venue") || "";
  const load = useCallback(
    async (signal) => {
      const venues = await getProfileVenues(request, user.name, {
        bookings: true,
        signal,
      });
      return { venues, groups: managerBookingGroups(venues) };
    },
    [request, user.name],
  );
  const { data, error, retry } = useAsync(load);

  const unavailable =
    data && venueId && !data.venues.some((venue) => venue.id === venueId);
  return (
    <section className="min-w-0 space-y-6">
      <DocumentTitle>Holidaze | Venue bookings</DocumentTitle>
      <div className="flex items-center gap-2">
        <h1 className="text-h3 font-bold sm:text-h2">Venue bookings</h1>
        <button
          type="button"
          aria-label={
            venueId
              ? "Refresh bookings and clear venue filter"
              : "Refresh bookings"
          }
          title={
            venueId
              ? "Refresh bookings and clear venue filter"
              : "Refresh bookings"
          }
          className="navigation-link size-11 shrink-0 justify-center p-0"
          onClick={() => {
            const nextParams = new URLSearchParams(params);
            nextParams.delete("venue");
            setParams(nextParams, { replace: true });
            retry();
          }}
        >
          <Icon name="reset" />
        </button>
      </div>
      <p className="text-muted">Reservations for your venues.</p>
      {error && (
        <p role="alert" className="text-danger">
          {messages.venueBookingsLoadFailed} {error.message}
        </p>
      )}
      {!data && !error && <Loading>Loading venue bookings…</Loading>}
      {unavailable ? (
        <p role="alert" className="text-danger">
          {messages.unavailableVenueFilter}
        </p>
      ) : (
        data &&
        (data.venues.length ? (
          Object.entries(data.groups).map(([status, bookings]) => {
            const filtered = bookings.filter(
              (booking) => !venueId || booking.venue.id === venueId,
            );
            const title = {
              upcoming: "Upcoming bookings",
              current: "Current bookings",
              past: "Past bookings",
              unknown: "Dates unavailable",
            }[status];
            return status === "unknown" && !filtered.length ? null : (
              <BookingGroup
                key={`${venueId}-${status}`}
                title={title}
                emptyMessage={`No ${title.toLowerCase()}.`}
                bookings={filtered}
              >
                {(booking) => (
                  <ManagerBookingCard key={booking.id} booking={booking} />
                )}
              </BookingGroup>
            );
          })
        ) : (
          <p className="empty-state rounded-xl border border-border bg-surface p-5 text-muted">
            You haven’t listed any venues yet.{" "}
            <Link to="/manager/venues/new" className="navigation-link">
              Create your first venue
            </Link>{" "}
            to receive bookings.
          </p>
        ))
      )}
    </section>
  );
}
