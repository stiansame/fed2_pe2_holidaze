import RetryButton from "../RetryButton.jsx";
import Loading from "../Loading.jsx";
import { useCallback, useId } from "react";
import useAsync from "../../hooks/useAsync.js";
import { useAuth } from "../../auth/AuthContext.js";
import { getProfileVenues } from "../../api/profiles.js";
import { managerSummary } from "../../utils/manager.js";
import ManagerBookingCard from "../bookings/ManagerBookingCard.jsx";
import VenueCard from "../venues/VenueCard.jsx";
import AccountStats from "./AccountStats.jsx";
import CollapsibleSection from "./CollapsibleSection.jsx";

/**
 * Loads owned venues and combines manager statistics with personal booking statistics.
 * @param {object} props Component props.
 * @param {import('react').ReactNode} props.children Content supplied by the parent.
 * @param {Array} props.stats Personal booking statistics added to the manager overview.
 * @returns {import('react').ReactNode}
 */
export default function ManagerOverview({ children, stats }) {
  const id = useId();
  const overviewHeadingId = `account-overview-heading-${id}`;
  const { user, request } = useAuth();
  const load = useCallback(
    async (signal) => {
      const venues = await getProfileVenues(request, user.name, {
        bookings: true,
        signal,
      });
      return { venues, ...managerSummary(venues) };
    },
    [request, user.name],
  );
  const { data, error, retry } = useAsync(load);

  const bookings = data
    ? [...data.current, ...data.upcoming].sort((a, b) =>
        a.dateFrom.localeCompare(b.dateFrom),
      )
    : [];
  return (
    <>
      <section
        className="grid items-start gap-4 lg:items-stretch lg:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)]"
        aria-labelledby={overviewHeadingId}
      >
        <h2 id={overviewHeadingId} className="sr-only">
          Account overview
        </h2>
        {children}
        <div className="min-w-0 self-stretch">
          {error ? (
            <div role="alert" className="space-y-3">
              <p>Unable to load your venue overview. {error.message}</p>
              <RetryButton onRetry={retry} />
            </div>
          ) : !data ? (
            <Loading>Loading your venue overview…</Loading>
          ) : (
            <AccountStats
              items={[
                ["My venues", data.venues.length, "building"],
                ["Total bookings", data.totalBookings, "calendar"],
                ["Upcoming bookings", data.upcoming.length, "bed"],
                [
                  "Average venue rating",
                  data.averageRating ?? "Not rated yet",
                  "star",
                ],
                ...stats,
              ]}
            />
          )}
        </div>
      </section>
      {data && (
        <>
          <CollapsibleSection
            title="My venues"
            count={data.venues.length}
            to="/manager/venues"
          >
            {data.venues.length ? (
              <div className="card-grid">
                {data.venues.slice(0, 3).map((venue) => (
                  <VenueCard key={venue.id} venue={venue} />
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-border bg-surface p-5 text-muted">
                You haven’t listed any venues yet. Create your first venue to
                get started.
              </p>
            )}
          </CollapsibleSection>
          <CollapsibleSection
            title="Venue bookings"
            count={bookings.length}
            to="/manager/bookings"
          >
            {bookings.length ? (
              <div className="card-grid">
                {bookings.slice(0, 3).map((booking) => (
                  <ManagerBookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-border bg-surface p-5 text-muted">
                No current or upcoming bookings for your venues.
              </p>
            )}
          </CollapsibleSection>
        </>
      )}
    </>
  );
}
