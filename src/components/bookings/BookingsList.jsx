import RetryButton from "../RetryButton.jsx";
import { messages } from "../../constants/messages.js";
import Loading from "../Loading.jsx";
import BookingGroup from "./BookingGroup.jsx";
import { useEffect, useId, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.js";
import { cancelBooking, getProfileBookings } from "../../api/bookings.js";
import { bookingStatus, groupBookings } from "../../utils/bookings.js";
import BookingCardDetails from "./BookingCardDetails.jsx";
import EditMenu from "../EditMenu.jsx";
import Icon from "../Icon.jsx";
import VenueImage from "../venues/VenueImage.jsx";
import Rating from "../venues/Rating.jsx";

/**
 * Loads customer bookings and groups them for account previews or the full booking page.
 * @param {object} props Component props.
 * @param {boolean} [props.upcomingOnly] Shows only the account preview of current/upcoming stays.
 * @param {Function} props.onLoaded Receives the loaded booking list.
 * @returns {import('react').ReactNode}
 */
export default function BookingsList({ upcomingOnly = false, onLoaded }) {
  const { user, request } = useAuth();
  const { search, state } = useLocation();
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [notice, setNotice] = useState(upcomingOnly ? "" : state?.notice || "");

  useEffect(() => {
    const controller = new AbortController();
    getProfileBookings(request, user.name, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) {
          setBookings(data);
          onLoaded?.(data);
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      });
    return () => controller.abort();
  }, [request, user.name, attempt, onLoaded]);

  const groups = bookings ? groupBookings(bookings) : null;
  return (
    <>
      {notice && (
        <p role="status" className="text-success">
          {notice}
        </p>
      )}
      {!upcomingOnly && bookings?.length > 0 && (
        <p className="text-muted">
          Prices are estimates based on the venue’s current nightly rate.
        </p>
      )}
      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}
      {!bookings && !error && <Loading>Loading your bookings…</Loading>}
      {error && (
        <RetryButton
          className="navigation-link text-small"
          onRetry={() => {
            setError("");
            setBookings(null);
            setAttempt((value) => value + 1);
          }}
        />
      )}
      {groups &&
        Object.entries(groups)
          .filter(([key, values]) =>
            upcomingOnly
              ? key === "upcoming"
              : key !== "unknown" || values.length > 0,
          )
          .map(([key, values]) => {
            const title =
              key === "upcoming"
                ? "My upcoming stays"
                : key === "past"
                  ? "Past stays"
                  : "Dates unavailable";
            return (
              <BookingGroup
                key={key}
                title={title}
                emptyMessage={`No ${title.replace(/^My /, "").toLowerCase()} yet.`}
                bookings={values}
                allLink={upcomingOnly ? "/bookings?show=upcoming" : undefined}
                initialExpanded={
                  new URLSearchParams(search).get("show") === key
                }
              >
                {(booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    manage={!upcomingOnly}
                    onCancelled={(id) => {
                      setBookings(
                        (current) =>
                          current?.filter((booking) => booking.id !== id) ??
                          current,
                      );
                      setNotice(messages.bookingCancelled);
                    }}
                  />
                )}
              </BookingGroup>
            );
          })}
    </>
  );
}

/**
 * Displays a customer booking with venue navigation and eligible change/cancel actions.
 * @param {object} props Component props.
 * @param {object} props.booking Booking with related venue/customer data.
 * @param {boolean} props.manage Enables eligible customer booking actions.
 * @param {Function} props.onCancelled Receives the cancelled booking ID.
 * @returns {import('react').ReactNode}
 */
function BookingCard({ booking, manage, onCancelled }) {
  const headingId = `stay-heading-${useId()}`;
  const { user, request } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const status = bookingStatus(booking);
  const editable = status === "upcoming";
  const name = booking.venue?.name?.trim() || "Venue unavailable";
  const venueLink = booking.venue?.id
    ? `/venues/${encodeURIComponent(booking.venue.id)}`
    : null;

  /**
   * Cancels the confirmed customer booking once and updates the parent list.
   * @returns {Promise<void>}
   */
  async function cancel() {
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setError("");
    try {
      await cancelBooking(request, booking.id, user.name);
      onCancelled(booking.id);
    } catch (error) {
      setError(messages.cancellationUnclear(error.message));
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <article className="card flex flex-col" aria-labelledby={headingId}>
      <div className="relative shrink-0">
        <VenueImage
          key={booking.venue?.media?.[0]?.url}
          media={booking.venue?.media?.[0]}
          name={name}
          className="relative aspect-video"
          imageClass={`absolute inset-0 object-cover ${status === "past" ? "saturate-25" : ""}`}
        />
        <Rating
          rating={booking.venue?.rating}
          className="absolute top-3 right-3"
        />
        {manage && (venueLink || editable) && (
          <div className="absolute bottom-3 right-3 z-10">
            <EditMenu label="Manage booking">
              {venueLink && (
                <Link to={venueLink} className="edit-menu-item">
                  <Icon name="building" />
                  View venue
                </Link>
              )}
              {editable && venueLink && !pending && (
                <Link
                  to={`/bookings/${encodeURIComponent(booking.id)}/edit`}
                  className="edit-menu-item"
                >
                  <Icon name="edit" />
                  Change booking
                </Link>
              )}
              {editable && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={(event) => {
                    setConfirming(true);
                    event.currentTarget.closest("details").open = false;
                  }}
                  className="edit-menu-item edit-menu-danger"
                >
                  <Icon name="trash" />
                  Cancel booking
                </button>
              )}
            </EditMenu>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-3 p-4">
        <BookingCardDetails
          headingId={headingId}
          booking={booking}
          title={
            venueLink ? (
              <Link to={venueLink} className="text-primary hover:underline">
                {name}
              </Link>
            ) : (
              name
            )
          }
        />
        {confirming && (
          <div className="space-y-3 rounded-lg bg-danger/5 p-3">
            <p className="text-small">
              {messages.confirmBookingCancellation(name)}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                autoFocus
                disabled={pending}
                onClick={cancel}
                className="h-11 rounded-lg bg-danger px-3 text-small font-semibold text-surface disabled:opacity-60"
              >
                {pending ? "Cancelling…" : "Confirm cancellation"}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setConfirming(false);
                  setError("");
                }}
                className="h-11 rounded-lg border border-border bg-surface px-3 text-small font-semibold text-primary disabled:opacity-60"
              >
                Keep booking
              </button>
            </div>
          </div>
        )}
        {error && (
          <p role="alert" className="text-small text-danger">
            {error}
          </p>
        )}
      </div>
    </article>
  );
}
