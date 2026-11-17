import RetryButton from "../components/RetryButton.jsx";
import DocumentTitle from "../components/DocumentTitle.jsx";
import { messages } from "../constants/messages.js";
import Loading from "../components/Loading.jsx";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.js";
import { getVenue } from "../api/venues.js";
import { createBooking } from "../api/bookings.js";
import { stayFromSearch, staySummary } from "../utils/availability.js";
import StaySummary from "../components/bookings/StaySummary.jsx";

/**
 * Resets reservation review when the venue or stay query changes.
 * @returns {import('react').ReactNode}
 */
export default function BookingReview() {
  const { id } = useParams();
  const { search } = useLocation();
  return <Review key={id + search} id={id} search={search} />;
}

/**
 * Loads the selected venue and confirms a validated reservation without duplicate submission.
 * @param {object} props Component props.
 * @param {string} props.id Route record ID.
 * @param {string} props.search URL query containing the selected stay.
 * @returns {import('react').ReactNode}
 */
function Review({ id, search }) {
  const { request } = useAuth();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [pending, setPending] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const submitting = useRef(false);
  const stay = stayFromSearch(search);
  const summary = venue ? staySummary(venue, stay) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
    const controller = new AbortController();
    getVenue(id, { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setVenue(data);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      });
    return () => controller.abort();
  }, [id, attempt]);

  /**
   * Confirms the reviewed stay and handles changed prices or uncertain saves.
   * @param {import('react').SubmitEvent<HTMLFormElement>} event Form submission event.
   * @returns {Promise<void>}
   */
  async function confirm(event) {
    event.preventDefault();
    if (submitting.current || uncertain || !venue || summary.error) return;
    submitting.current = true;
    setPending(true);
    setError("");
    try {
      const result = await createBooking(request, id, stay, venue.price);
      setVenue(result.venue);
      if (!result.booking) {
        setError(messages.bookingPriceChanged);
        return;
      }
      navigate(
        `/bookings/${encodeURIComponent(result.booking.id)}/confirmation`,
        { replace: true },
      );
    } catch (error) {
      setUncertain(!!error.bookingUncertain);
      setError(
        error.bookingUncertain ? messages.bookingUncertain : error.message,
      );
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <section
      className="mx-auto max-w-xl space-y-5 rounded-xl border border-border bg-surface p-5 sm:p-8"
      aria-busy={pending}
    >
      <DocumentTitle>Holidaze | Review booking</DocumentTitle>
      <h1 className="text-h3 font-bold">Review your booking</h1>
      {!venue && !error && <Loading>Loading your stay…</Loading>}
      {venue && (
        <>
          <StaySummary venue={venue} stay={stay} summary={summary} />
          {summary.error && (
            <p role="alert" className="text-danger">
              {summary.error}
            </p>
          )}
          <form onSubmit={confirm}>
            <button
              disabled={pending || uncertain || !!summary.error}
              className="primary-button w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Reserving…" : "Confirm reservation"}
            </button>
          </form>
        </>
      )}
      {error && (
        <p role="alert" className="whitespace-pre-line text-danger">
          {error}
        </p>
      )}
      {!venue && error && (
        <RetryButton
          onRetry={() => {
            setError("");
            setAttempt((value) => value + 1);
          }}
        />
      )}
      {!pending && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="navigation-link"
        >
          Back to dates
        </button>
      )}
    </section>
  );
}
