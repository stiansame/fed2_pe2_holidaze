import RetryButton from "../components/RetryButton.jsx";
import DocumentTitle from "../components/DocumentTitle.jsx";
import { messages } from "../constants/messages.js";
import Loading from "../components/Loading.jsx";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useSubmit from "../hooks/useSubmit.js";
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
  const [reviewedVenue, setVenue] = useState(null);
  const [uncertain, setUncertain] = useState(false);
  const {
    data,
    error: loadError,
    refetch,
  } = useQuery({
    queryKey: ["reviewVenue", id],
    queryFn: async ({ signal }) => {
      window.scrollTo(0, 0);
      const { data } = await getVenue(id, { signal });
      return data;
    },
  });
  const { submit, pending, error: saveError, setError } = useSubmit(confirm);
  const venue = reviewedVenue ?? data;
  const error = saveError || loadError?.message || "";
  const stay = stayFromSearch(search);
  const summary = venue ? staySummary(venue, stay) : null;

  /**
   * Confirms the reviewed stay and handles changed prices or uncertain saves.
   * @returns {Promise<void>}
   */
  async function confirm() {
    if (uncertain || !venue || summary.error) return;
    try {
      const result = await createBooking(request, id, stay, venue.price);
      setVenue(result.venue);
      if (!result.booking) throw new Error(messages.bookingPriceChanged);
      navigate(
        `/bookings/${encodeURIComponent(result.booking.id)}/confirmation`,
        { replace: true },
      );
    } catch (error) {
      setUncertain(!!error.bookingUncertain);
      throw new Error(
        error.bookingUncertain ? messages.bookingUncertain : error.message,
        { cause: error },
      );
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
          <form onSubmit={submit}>
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
            void refetch();
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
