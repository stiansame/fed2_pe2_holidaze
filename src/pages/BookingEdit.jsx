import { queryKeys } from "../api/queryKeys.js";
import RetryButton from "../components/RetryButton.jsx";
import DocumentTitle from "../components/DocumentTitle.jsx";
import { messages } from "../constants/messages.js";
import Loading from "../components/Loading.jsx";
import BackLink from "../components/BackLink.jsx";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useSubmit from "../hooks/useSubmit.js";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.js";
import { getEditableBooking, updateBooking } from "../api/bookings.js";
import { getVenue } from "../api/venues.js";
import { bookingDates } from "../utils/bookings.js";
import { staySummary } from "../utils/availability.js";
import AvailabilityCalendar from "../components/venues/AvailabilityCalendar.jsx";
import StaySummary from "../components/bookings/StaySummary.jsx";

/**
 * Loads an editable customer booking and fresh venue data before showing its editor.
 * @returns {import('react').ReactNode}
 */
export default function BookingEdit() {
  const { id } = useParams();
  const { user, request } = useAuth();
  const { data, error, refetch } = useQuery({
    queryKey: queryKeys.editableBooking(user.name, id),
    queryFn: async ({ signal }) => {
      const booking = await getEditableBooking(request, id, user.name, {
        signal,
      });
      if (!booking.venue?.id) throw new Error(messages.venueUnavailable);
      const { data: venue } = await getVenue(booking.venue.id, { signal });
      return { booking, venue };
    },
  });

  return (
    <section className="mx-auto max-w-xl space-y-5 rounded-xl border border-border bg-surface p-4 sm:p-6">
      <DocumentTitle>Holidaze | Change booking</DocumentTitle>
      <h1 className="text-h3 font-bold">Change booking</h1>
      {!data && !error && <Loading>Loading your booking…</Loading>}
      {data && (
        <BookingEditor booking={data.booking} initialVenue={data.venue} />
      )}
      {error && (
        <>
          <p role="alert" className="text-danger">
            {error.message}
          </p>
          <RetryButton onRetry={() => refetch()} />
        </>
      )}
      {!data && <BackLink />}
    </section>
  );
}

/**
 * Reviews or discards changed dates/guests, requesting another review if the price changed.
 * @param {object} props Component props.
 * @param {object} props.booking Booking with related venue/customer data.
 * @param {object} props.initialVenue Fresh venue data loaded for editing.
 * @returns {import('react').ReactNode}
 */
function BookingEditor({ booking, initialVenue }) {
  const { request, user } = useAuth();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(initialVenue);
  const [stay, setStay] = useState(() => bookingDates(booking));
  const [reviewing, setReviewing] = useState(false);
  const summary = staySummary(venue, stay, booking.id);
  const { submit, pending, error, setError } = useSubmit(async () => {
    if (summary.error) return;
    const result = await updateBooking(
      request,
      booking.id,
      user.name,
      stay,
      venue.price,
    );
    setVenue(result.venue);
    if (!result.booking) throw new Error(messages.bookingEditPriceChanged);
    navigate("/bookings", {
      replace: true,
      state: { notice: messages.bookingUpdated },
    });
  });

  const cancelAction = (
    <button
      type="button"
      disabled={pending}
      onClick={() => navigate("/bookings", { replace: true })}
      className="navigation-link justify-center text-small"
    >
      Cancel changes
    </button>
  );

  return reviewing ? (
    <div className="space-y-5">
      <StaySummary venue={venue} stay={stay} summary={summary} />
      {summary.error && (
        <p role="alert" className="text-danger">
          {summary.error}
        </p>
      )}
      <form onSubmit={submit}>
        <button
          disabled={pending || !!summary.error}
          className="primary-button w-full text-small"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </form>
      <div className="grid grid-cols-2 items-stretch gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setReviewing(false);
            setError("");
          }}
          className="navigation-link justify-center text-small"
        >
          Back to dates
        </button>
        {cancelAction}
      </div>
      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
    </div>
  ) : (
    <AvailabilityCalendar
      bookings={venue.bookings?.filter((item) => item.id !== booking.id)}
      maxGuests={venue.maxGuests}
      actions={cancelAction}
      initialStay={stay}
      actionLabel="Review changes"
      onReserve={(selection) => {
        setStay(selection);
        setReviewing(true);
      }}
    />
  );
}
