import { useId } from "react";
import Amenities from "./Amenities.jsx";
import Rating from "./Rating.jsx";
import Icon from "../Icon.jsx";
import VenueImage from "./VenueImage.jsx";
import { Link, useLocation } from "react-router-dom";
import { formatLocation, formatVenuePrice } from "../../utils/venue.js";

/**
 * Displays shared venue information and opens its detail page.
 * @param {object} props Component props.
 * @param {object} props.venue Venue data.
 * @param {Function} props.onImageError Reports a failed cover image.
 * @param {import('react').ReactNode} props.actions Additional actions rendered in the shared layout.
 * @returns {import('react').ReactNode}
 */
export default function VenueCard({ venue, onImageError, actions }) {
  const headingId = `venue-heading-${useId()}`;
  const routeLocation = useLocation();
  const { search } = routeLocation;
  const name = venue.name?.trim() || "Unnamed stay";
  const location = formatLocation(venue.location);
  return (
    <article
      className="card card-interactive relative"
      aria-labelledby={headingId}
    >
      <Link
        to={`/venues/${encodeURIComponent(venue.id)}${search}`}
        aria-label={`View ${name}`}
        className="block h-full focus-visible:-outline-offset-4"
      >
        <div className="relative">
          <VenueImage
            key={venue.media?.[0]?.url || "missing"}
            media={venue.media?.[0]}
            name={name}
            className="h-65 rounded-t-lg"
            imageClass="venue-photo object-cover"
            onImageError={() => onImageError?.(venue.id)}
          />
          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <span className="pill guest-pill min-w-0 gap-1.5 bg-surface text-caption font-semibold text-text">
              <Icon name="user" className="size-4 shrink-0 text-primary" />
              {venue.maxGuests > 0
                ? `${venue.maxGuests} ${venue.maxGuests === 1 ? "guest" : "guests"}`
                : "Capacity not specified"}
            </span>
            <Rating rating={venue.rating} />
          </div>
        </div>
        <div className="grid items-start gap-2 p-4">
          <div className="min-w-0 space-y-2">
            <h2
              id={headingId}
              className="truncate text-h3 font-semibold"
              title={name}
            >
              {name}
            </h2>
            <Amenities meta={venue.meta} />
            <p
              title={location}
              className="flex min-w-0 items-center gap-2 text-small text-muted"
            >
              <Icon name="pin" className="size-4 shrink-0 text-success" />
              <span className="truncate">{location}</span>
            </p>
          </div>
          <p className="text-small font-semibold wrap-anywhere">
            {formatVenuePrice(venue.price)}
          </p>
        </div>
      </Link>
      {actions && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-65">
          <div className="pointer-events-auto absolute bottom-3 right-3 z-10">
            {actions}
          </div>
        </div>
      )}
    </article>
  );
}
