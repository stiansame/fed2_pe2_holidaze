import { useId } from "react";
import { Link, useLocation } from "react-router-dom";
import VenueImage from "../venues/VenueImage.jsx";
import HostAvatar from "../HostAvatar.jsx";
import Icon from "../Icon.jsx";
import {
  bookingPrice,
  bookingStatus,
  formatBookingRange,
} from "../../utils/bookings.js";
import { formatLocation, formatPrice } from "../../utils/venue.js";

const pillClass = "pill max-w-full gap-1 bg-surface text-caption text-text";

/**
 * Links a compact guest/venue booking card to the manager booking summary.
 * @param {object} props Component props.
 * @param {object} props.booking Booking with related venue/customer data.
 * @returns {import('react').ReactNode}
 */
export default function ManagerBookingCard({ booking }) {
  const headingId = `booking-heading-${useId()}`;
  const location = useLocation();
  const venue = booking.venue;
  const name = venue.name?.trim() || "Venue unavailable";
  const place = formatLocation(venue.location);
  const price = bookingPrice(booking);
  return (
    <article
      className="card card-interactive relative"
      aria-labelledby={headingId}
    >
      <Link
        to={`/manager/bookings/${encodeURIComponent(booking.id)}${location.search}`}
        className="block h-full focus-visible:-outline-offset-4"
      >
        <VenueImage
          key={venue.media?.[0]?.url}
          media={venue.media?.[0]}
          name={name}
          className="absolute inset-0"
          imageClass={`object-cover ${bookingStatus(booking) === "past" ? "saturate-25" : ""}`}
        />
        <div className="relative flex min-h-72 min-w-0 flex-col justify-between gap-8 bg-linear-to-t from-black/50 via-transparent to-transparent p-3">
          <div className="flex min-w-0 flex-col items-start gap-1.5">
            <h3
              id={headingId}
              title={name}
              className={`${pillClass} font-semibold`}
            >
              <span className="truncate">{name}</span>
            </h3>
            <p title={place} className={pillClass}>
              <Icon name="pin" className="size-4 shrink-0 text-success" />
              <span className="truncate">{place}</span>
            </p>
          </div>
          <div className="min-w-0 space-y-1.5">
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-1.5">
              <p className={`${pillClass} relative`}>
                <HostAvatar
                  key={booking.customer?.avatar?.url}
                  media={booking.customer?.avatar}
                  className="absolute top-1/2 left-0 size-8 -translate-y-1/2 border-2 border-surface"
                />
                <span className="ml-7 min-w-0 truncate">
                  {booking.customer?.name?.trim() || "Guest name unavailable"}
                </span>
              </p>
              <p className={`${pillClass} min-w-0`}>
                <Icon name="user" className="size-4 shrink-0" />
                <span className="whitespace-nowrap">
                  {Number.isInteger(booking.guests) && booking.guests > 0
                    ? `${booking.guests} ${booking.guests === 1 ? "guest" : "guests"}`
                    : "Guests unavailable"}
                </span>
              </p>
              <p className={`${pillClass} min-w-0`}>
                <Icon name="moon" className="size-4 shrink-0" />
                <span className="whitespace-nowrap">
                  {price
                    ? `${price.nights} ${price.nights === 1 ? "night" : "nights"}`
                    : "Nights unavailable"}
                </span>
              </p>
            </div>
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-1.5">
              <p className={pillClass}>
                <Icon name="calendar" className="size-4 shrink-0" />
                <span className="whitespace-nowrap">
                  {formatBookingRange(booking)}
                </span>
              </p>
              <p
                className={`${pillClass} ml-auto font-semibold whitespace-nowrap`}
              >
                {price ? formatPrice(price.total) : "Total unavailable"}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
