import DocumentTitle from "../components/DocumentTitle.jsx";
import { messages } from "../constants/messages.js";
import Loading from "../components/Loading.jsx";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.js";
import { getOwnBooking } from "../api/bookings.js";

/**
 * Resets the confirmation when a different booking is opened.
 * @returns {import('react').ReactNode}
 */
export default function BookingConfirmation() {
  const { id } = useParams();
  return <Confirmation key={id} id={id} />;
}

/**
 * Shows the saved booking after checking customer ownership.
 * @param {{id: string}} props Booking route ID.
 * @returns {import('react').ReactNode}
 */
function Confirmation({ id }) {
  const { request, user } = useAuth();
  const {
    data: booking,
    error,
    refetch,
  } = useQuery({
    queryKey: ["ownBooking", user.name, id],
    queryFn: ({ signal }) => {
      window.scrollTo(0, 0);
      return getOwnBooking(request, id, user.name, { signal });
    },
  });

  return (
    <section className="mx-auto max-w-xl space-y-5 rounded-xl border border-border bg-surface p-5 sm:p-8">
      <DocumentTitle>Holidaze | Booking confirmation</DocumentTitle>
      <h1 className="text-h3 font-bold">
        {booking ? "Booking confirmed" : "Booking confirmation"}
      </h1>
      {!booking && !error && <Loading>Loading your reservation…</Loading>}
      {booking && (
        <>
          <p role="status" className="text-success">
            {messages.reservationSaved}
          </p>
          <h2 className="text-h3 font-semibold wrap-anywhere">
            {booking.venue?.name || "Your stay"}
          </h2>
          <dl className="space-y-3">
            {[
              ["Booking reference", booking.id],
              ["Check-in", booking.dateFrom.slice(0, 10)],
              ["Check-out", booking.dateTo.slice(0, 10)],
              ["Guests", booking.guests],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-small text-muted">{label}</dt>
                <dd className="font-semibold wrap-anywhere">{value}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
      {error && (
        <>
          <p role="alert" className="text-danger">
            {messages.confirmationLoadFailed(error.message)}
          </p>
          <button
            onClick={() => refetch()}
            className="h-11 rounded-lg border border-border px-4 text-primary"
          >
            Reload confirmation
          </button>
        </>
      )}
      <div className="flex flex-wrap gap-3">
        {booking?.venue?.id && (
          <Link
            to={`/venues/${encodeURIComponent(booking.venue.id)}`}
            className="navigation-link"
          >
            View venue
          </Link>
        )}
        <Link to="/bookings" className="navigation-link">
          My stays
        </Link>
        <Link to="/venues" className="navigation-link">
          Explore venues
        </Link>
      </div>
    </section>
  );
}
