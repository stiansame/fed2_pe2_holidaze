import RetryButton from "../components/RetryButton.jsx";
import { messages } from "../constants/messages.js";
import Loading from "../components/Loading.jsx";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { venueListOptions } from "../api/venueQueries.js";
import { selectHighlyRatedVenues } from "../utils/venue.js";
import HomeHero from "../components/venues/HomeHero.jsx";
import VenueCard from "../components/venues/VenueCard.jsx";
import Icon from "../components/Icon.jsx";

/**
 * Chooses a hero and up to twelve randomised eligible stays from the cached venue pool.
 * @returns {import('react').ReactNode}
 */
export default function Home() {
  const {
    data: pool,
    error,
    isPending,
    refetch,
  } = useQuery({
    ...venueListOptions(),
    select: selectHighlyRatedVenues,
  });
  const [failedPhotos, setFailedPhotos] = useState([]);
  const highlyRated =
    pool?.filter((venue) => !failedPhotos.includes(venue.id)) ?? [];
  // The shuffled pool chooses the hero independently of failed card images.
  const heroImage = pool?.[0]?.media[0]?.url ?? null;
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <HomeHero image={heroImage}>
        <form
          role="search"
          className="flex gap-2 rounded-lg border border-border bg-surface p-2 text-text shadow-sm sm:gap-3 sm:p-3"
          onSubmit={(event) => {
            event.preventDefault();
            const input = event.currentTarget.elements.q;
            const q = input.value.trim();
            if (q && q.length < 3) {
              input.setCustomValidity(messages.shortSearch);
              input.reportValidity();
              return;
            }
            navigate(`/venues${q ? `?${new URLSearchParams({ q })}` : ""}`);
          }}
        >
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border px-3 text-muted focus-within:border-primary focus-within:ring-2 focus-within:ring-primary">
            <Icon name="search" className="hidden size-5 shrink-0 sm:block" />
            <span className="sr-only">Search venues</span>
            <input
              name="q"
              type="search"
              minLength="3"
              onInput={(event) => event.currentTarget.setCustomValidity("")}
              placeholder="Search venues"
              className="h-11 min-w-0 w-full bg-surface text-text focus-visible:outline-none"
            />
          </label>
          <button type="submit" className="primary-button px-3 sm:px-6">
            Search
          </button>
        </form>
      </HomeHero>
      <section aria-labelledby="discover-heading" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="discover-heading" className="text-h3 font-bold sm:text-h2">
            Highly rated stays
          </h2>
          <Link to="/venues" className="navigation-link gap-2">
            View all venues
            <Icon name="right" />
          </Link>
        </div>
        {isPending ? (
          <Loading>Loading stays…</Loading>
        ) : error ? (
          <div role="alert" className="space-y-3">
            <p>
              {messages.staysLoadFailed} {error.message}
            </p>
            <RetryButton onRetry={() => refetch()} />
          </div>
        ) : highlyRated.length ? (
          <div className="card-grid gap-6 lg:grid-cols-3">
            {highlyRated.slice(0, 12).map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                onImageError={(id) =>
                  setFailedPhotos((previous) => [...previous, id])
                }
              />
            ))}
          </div>
        ) : (
          <p>
            No highly rated stays with multiple photos are available right now.
            Explore all venues to find your next stay.
          </p>
        )}
      </section>
    </div>
  );
}
