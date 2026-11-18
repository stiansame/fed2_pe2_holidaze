import RetryButton from "../components/RetryButton.jsx";
import DocumentTitle from "../components/DocumentTitle.jsx";
import { messages } from "../constants/messages.js";
import Loading from "../components/Loading.jsx";
import BackLink from "../components/BackLink.jsx";
import { useCallback, useRef, useState } from "react";
import useAsync from "../hooks/useAsync.js";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.js";
import { getEditableBooking, updateBooking } from "../api/bookings.js";
import { getVenue } from "../api/venues.js";
import { bookingDates } from "../utils/bookings.js";
import { staySummary } from "../utils/availability.js";
import AvailabilityCalendar from "../components/venues/AvailabilityCalendar.jsx";
import StaySummary from "../components/bookings/StaySummary.jsx";

/**
 * Resets the booking editor when the route ID changes.
 * @returns {import('react').ReactNode}
 */
export default function BookingEdit() {
  const { id } = useParams();
  return <EditLoader key={id} id={id} />;
}

/**
 * Loads an editable customer booking and fresh venue data before showing its editor.
 * @param {object} props Component props.
 * @param {string} props.id Route record ID.
 * @returns {import('react').ReactNode}
 */
function EditLoader({ id }) {
  const { user, request } = useAuth();
  const load = useCallback(
    async (signal) => {
      const booking = await getEditableBooking(request, id, user.name, { signal });
      if (!booking.venue?.id) throw new Error(messages.venueUnavailable);
      const { data: venue } = await getVenue(booking.venue.id, { signal });
      return { booking, venue };
    },
    [id, request, user.name],
  );
  const { data, error, retry } = useAsync(load);

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
          <RetryButton onRetry={retry} />
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
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const summary = staySummary(venue, stay, booking.id);

  /**
   * Saves reviewed booking changes or asks for review again when the price changed.
   * @param {import('react').SubmitEvent<HTMLFormElement>} event Form submission event.
   * @returns {Promise<void>}
   */
  async function save(event) {
    event.preventDefault();
    if (submitting.current || summary.error) return;
    submitting.current = true;
    setPending(true);
    setError("");
    try {
      const result = await updateBooking(
        request,
        booking.id,
        user.name,
        stay,
        venue.price,
      );
      setVenue(result.venue);
      if (!result.booking) {
        setError(messages.bookingEditPriceChanged);
        return;
      }
      navigate("/bookings", {
        replace: true,
        state: { notice: messages.bookingUpdated },
      });
    } catch (error) {
      setError(error.message);
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  const cancelAction = (
    <button
      type="button"
      disabled={pending}
      onClick={() => navigate("/bookings", { replace: true })}
      className="navigation-link justify-center text-small disabled:opacity-60"
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
      <form onSubmit={save}>
        <button
          disabled={pending || !!summary.error}
          className="primary-button w-full text-small disabled:opacity-60"
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
          className="navigation-link justify-center text-small disabled:opacity-60"
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
