import { sameName } from "../utils/account.js";
import NotFound from "./NotFound.jsx";
import RetryButton from "../components/RetryButton.jsx";
import DocumentTitle from "../components/DocumentTitle.jsx";
import { messages } from "../constants/messages.js";
import Loading from "../components/Loading.jsx";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { venueOptions } from "../api/venueQueries.js";
import { useAuth } from "../auth/AuthContext.js";
import Icon from "../components/Icon.jsx";
import BackLink from "../components/BackLink.jsx";
import HostAvatar from "../components/HostAvatar.jsx";
import Amenities from "../components/venues/Amenities.jsx";
import Rating from "../components/venues/Rating.jsx";
import VenueGallery from "../components/venues/VenueGallery.jsx";
import VenueMapBoundary from "../components/venues/VenueMapBoundary.jsx";
import VenueDescription from "../components/venues/VenueDescription.jsx";
import VenueBooking from "../components/venues/VenueBooking.jsx";
import VenueOwnerActions from "../components/venues/VenueOwnerActions.jsx";
import {
  formatAddress,
  formatLocation,
  venueMapLinks,
} from "../utils/venue.js";

/**
 * Loads and presents venue photos, host details, amenities, booking and optional map.
 * @returns {import('react').ReactNode}
 */
export default function VenueDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: venue, error, refetch } = useQuery(venueOptions(id));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const name = venue?.name?.trim() || "Unnamed stay";
  const owner = venue?.owner;
  const ownerName = owner?.name?.trim() || "";
  const isOwner = user?.venueManager && sameName(user.name, ownerName);
  const notFound = error && [400, 404].includes(error.status);
  if (notFound) return <NotFound kind="venue" />;
  const map = venueMapLinks(venue?.location);
  const location = venue?.location;
  const place = formatLocation(location);
  const address = formatAddress(location);
  const venueTitle = (
    <h1
      title={name}
      className="min-w-0 truncate text-body font-bold lg:text-h2 lg:whitespace-normal lg:wrap-anywhere"
    >
      {name}
    </h1>
  );
  return (
    <section className="venue-details space-y-5 rounded-2xl border border-border bg-linear-to-br from-accent/10 via-surface to-tint/40 p-4 sm:p-6 lg:p-8">
      <DocumentTitle>{`${venue ? name : "Venue details"} | Holidaze`}</DocumentTitle>
      <div className={venue && !error ? "hidden lg:block" : "block"}>
        <BackLink />
      </div>
      {error ? (
        <>
          <h1 className="text-h3 font-bold sm:text-h2">
            {messages.venueLoadFailed}
          </h1>
          <p role="alert">{error.message}</p>
          <RetryButton className="primary-button" onRetry={() => refetch()} />
        </>
      ) : !venue ? (
        <Loading>Loading stay…</Loading>
      ) : (
        <>
          <VenueGallery
            media={venue.media}
            name={name}
            backLink={<BackLink iconOnly />}
          >
            {isOwner && <VenueOwnerActions venue={venue} />}
          </VenueGallery>
          <div className="grid items-start gap-x-8 lg:gap-y-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="min-w-0 space-y-6">
              <div className="space-y-3 border-b border-border pb-5">
                <div className="flex min-w-0 items-center gap-2 lg:items-start lg:gap-3">
                  {venueTitle}
                  <Rating rating={venue.rating} />
                </div>
                <div className="flex items-center gap-3 text-small">
                  <p
                    title={place}
                    className="flex min-w-0 flex-1 items-center gap-1 text-muted lg:gap-2"
                  >
                    <Icon
                      name="pin"
                      className="size-4 shrink-0 text-success lg:size-5"
                    />
                    <span className="truncate lg:whitespace-normal lg:wrap-anywhere">
                      {place}
                    </span>
                  </p>
                  <p className="pill accent-box ml-auto shrink-0 gap-1 text-caption lg:gap-2 lg:text-small">
                    <Icon name="user" className="size-4 shrink-0 lg:size-5" />
                    {venue.maxGuests > 0
                      ? `${venue.maxGuests} ${venue.maxGuests === 1 ? "guest" : "guests"}`
                      : "Capacity unknown"}
                  </p>
                </div>
                <div>
                  {Object.values(venue.meta ?? {}).some(
                    (value) => value === true,
                  ) ? (
                    <Amenities meta={venue.meta} compact />
                  ) : (
                    <p className="text-small text-muted">
                      No amenities listed.
                    </p>
                  )}
                </div>
              </div>
              <section className="space-y-3">
                <h2 className="text-body font-semibold text-primary">
                  About this stay
                </h2>
                <VenueDescription description={venue.description} />
              </section>
              <section className="space-y-2 rounded-lg border-l-4 border-accent bg-accent/10 p-3 lg:p-4">
                <h2 className="flex min-w-0 items-center gap-2 text-small font-bold lg:text-body">
                  <span className="shrink-0">Hosted by</span>
                  {ownerName && (
                    <Link
                      title={ownerName}
                      to={`/profiles/${encodeURIComponent(ownerName)}`}
                      className="min-w-0 truncate rounded text-primary hover:underline"
                    >
                      {ownerName}
                    </Link>
                  )}
                </h2>
                <div className="flex items-start gap-3">
                  {ownerName && (
                    <Link
                      aria-label={`View ${ownerName}'s profile`}
                      to={`/profiles/${encodeURIComponent(ownerName)}`}
                      className="shrink-0 rounded-full"
                    >
                      <HostAvatar
                        key={owner.avatar?.url}
                        media={owner.avatar}
                      />
                    </Link>
                  )}
                  <p className="min-w-0 whitespace-pre-line text-small text-muted wrap-anywhere">
                    {ownerName
                      ? owner.bio?.trim() || "No host bio provided."
                      : "Host information not available."}
                  </p>
                </div>
              </section>
              <section className="space-y-3 border-t border-border pt-5">
                <h2 className="text-h3 font-bold">Location</h2>
                <p className="flex items-center gap-2 text-muted wrap-anywhere">
                  <Icon name="pin" className="size-5 shrink-0 text-success" />
                  {address || "Location not specified"}
                </p>
                {map ? (
                  <div className="max-w-155 space-y-2">
                    <VenueMapBoundary
                      lat={location.lat}
                      lng={location.lng}
                      compact
                    />
                    <a
                      href={map}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="navigation-link text-small"
                    >
                      View larger map · © OpenStreetMap contributors
                    </a>
                  </div>
                ) : (
                  <p className="text-small text-muted">
                    {messages.mapLocationUnavailable}
                  </p>
                )}
              </section>
            </div>
            <VenueBooking venue={venue} />
          </div>
        </>
      )}
    </section>
  );
}
