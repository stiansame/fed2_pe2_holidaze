import { messages } from "../constants/messages.js";
import Loading from "../components/Loading.jsx";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  filterVenues,
  getAllVenues,
  sortVenues,
  venueSorts,
} from "../api/venues.js";
import { amenityOptions } from "../components/venues/amenityOptions.js";
import AmenityPill from "../components/venues/AmenityPill.jsx";
import VenueCard from "../components/venues/VenueCard.jsx";
import GuestSelect from "../components/GuestSelect.jsx";
import Icon from "../components/Icon.jsx";
import {
  addDays,
  dateKey,
  guestCountError,
  validDate,
} from "../utils/availability.js";
import { hasVenuePhoto } from "../utils/venue.js";

const buttonClass =
  "h-11 rounded-lg bg-primary px-5 font-semibold text-surface hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60";
const fieldClass =
  "flex h-11 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-body focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2";
const selectClass =
  "h-full min-w-0 w-full rounded-lg bg-transparent p-0 text-body font-normal outline-none!";

/**
 * Keeps search, filter and sort selections in the URL, debouncing text input.
 * @returns {import('react').ReactNode}
 */
export default function Venues() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q")?.trim() || "";
  const order = Object.hasOwn(venueSorts, params.get("order"))
    ? params.get("order")
    : "newest";
  const guests = Number(params.get("guests") || 0);
  const guestError = guestCountError(guests, 100, 0);
  const amenities = amenityOptions
    .filter((item) => params.get(item.key) === "true")
    .map((item) => item.key);
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const datesSelected = Boolean(from || to);
  const dateError =
    datesSelected && (!validDate(from) || !validDate(to))
      ? messages.incompleteSearchDates
      : datesSelected && (from < dateKey() || to <= from)
        ? messages.invalidSearchDates
        : "";
  const activeFilters =
    Number(guests > 0) +
    amenities.length +
    Number(order !== "newest") +
    Number(datesSelected);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [search, setSearch] = useState({ value: q, url: q });
  // Synchronise the input on back/forward navigation without replacing the focused input.
  if (search.url !== q) setSearch({ value: q, url: q });
  const value = search.value.trim();
  const tooShort = value.length > 0 && value.length < 3;
  const waiting = value !== q;

  useEffect(() => {
    if (value === q || (value.length > 0 && value.length < 3)) return;
    const timer = setTimeout(
      () => {
        setParams(
          (previous) => {
            const next = new URLSearchParams(previous);
            if (value) next.set("q", value);
            else next.delete("q");
            return next;
          },
          { replace: true },
        );
      },
      value ? 350 : 0,
    );
    return () => clearTimeout(timer);
  }, [value, q, setParams]);

  /**
   * Sets or removes one URL parameter while preserving the remaining search selections.
   * @param {string} name Query parameter name.
   * @param {string|number|boolean} value New value; falsy values remove the parameter.
   * @returns {void}
   */
  function update(name, value) {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value) next.set(name, value);
      else next.delete(name);
      return next;
    });
  }

  /**
   * Clears date, guest, amenity and sort filters while retaining the text query.
   * @returns {void}
   */
  function resetFilters() {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      [
        "guests",
        "order",
        "from",
        "to",
        ...amenityOptions.map((item) => item.key),
      ].forEach((key) => next.delete(key));
      return next;
    });
  }

  return (
    <section aria-labelledby="venues-heading">
      <h1 id="venues-heading" className="text-h3 font-bold sm:text-h2">
        Explore venues
      </h1>
      <p className="mt-2 text-small text-muted sm:text-body">
        Find somewhere worth staying.
      </p>
      <form
        role="search"
        className="mt-4 grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-3 sm:mt-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.6fr)_minmax(0,0.8fr)]"
        onSubmit={(event) => event.preventDefault()}
      >
        <label className={`${fieldClass} min-w-0 lg:order-2`}>
          <span className="sr-only">Search venues</span>
          <Icon name="search" />
          <input
            name="q"
            type="search"
            value={search.value}
            onChange={(event) =>
              setSearch({ value: event.target.value, url: q })
            }
            aria-describedby="search-hint"
            placeholder="Search venues, locations or hosts"
            className="h-full w-full min-w-0 bg-transparent outline-none!"
          />
        </label>
        <button
          type="button"
          aria-label={`Filters and sort${activeFilters ? `, ${activeFilters} active` : ""}`}
          aria-expanded={filtersOpen}
          aria-controls="venue-filters"
          onClick={() => setFiltersOpen((value) => !value)}
          className="navigation-link relative size-11 justify-center p-0 lg:hidden"
        >
          <Icon name="filter" />
          {activeFilters > 0 && (
            <span
              aria-hidden="true"
              className="absolute -right-1 -top-2 rounded-full bg-primary px-1.5 py-0.5 text-caption text-surface"
            >
              {activeFilters}
            </span>
          )}
        </button>
        <div
          id="venue-filters"
          className={`${filtersOpen ? "grid" : "hidden"} col-span-2 min-w-0 gap-3 rounded-xl border border-border bg-surface/60 p-3 lg:contents`}
        >
          <div className="flex flex-wrap items-center gap-2 lg:order-1 lg:col-span-3">
            <label className={`${fieldClass} min-w-0 max-w-full`}>
              <span className="sr-only">Sort by</span>
              <Icon name="sort" />
              <select
                value={order}
                onChange={(event) =>
                  update(
                    "order",
                    event.target.value === "newest" ? "" : event.target.value,
                  )
                }
                className={selectClass}
              >
                {Object.entries(venueSorts).map(([key, option]) => (
                  <option key={key} value={key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div
              role="group"
              aria-label="Amenities"
              className="flex flex-wrap gap-2"
            >
              {amenityOptions.map((item) => (
                <AmenityPill
                  key={item.key}
                  item={item}
                  selected={amenities.includes(item.key)}
                  onClick={() =>
                    update(item.key, amenities.includes(item.key) ? "" : "true")
                  }
                />
              ))}
            </div>
            <button
              type="button"
              disabled={!activeFilters}
              aria-label="Reset filters"
              title="Reset filters"
              className="navigation-link size-11 justify-center gap-2 p-0 text-body disabled:opacity-50 lg:ml-auto lg:w-auto lg:px-4"
              onClick={resetFilters}
            >
              <Icon name="reset" />
              <span className="sr-only lg:not-sr-only">Reset filters</span>
            </button>
          </div>
          <details
            className="relative min-w-0 lg:order-3"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.currentTarget.open = false;
                event.currentTarget.querySelector("summary").focus();
              }
            }}
          >
            <summary
              className={`${fieldClass} w-full cursor-pointer lg:h-full list-none [&::-webkit-details-marker]:hidden`}
            >
              <Icon name="calendar" />
              <span className="min-w-0 truncate">
                {from || "Check-in"} — {to || "Check-out"}
              </span>
            </summary>
            <div className="mt-2 grid lg:absolute lg:inset-x-0 lg:top-full lg:z-10 gap-3 rounded-xl border border-border bg-surface p-4 shadow-lg sm:grid-cols-2">
              <label className="min-w-0 text-small font-semibold">
                Check-in
                <input
                  type="date"
                  value={validDate(from) ? from : ""}
                  min={dateKey()}
                  onChange={(event) => update("from", event.target.value)}
                  aria-invalid={Boolean(dateError)}
                  aria-describedby="date-hint"
                  className="mt-1 h-11 w-full min-w-0 rounded-lg border border-border bg-surface px-2 text-body font-normal"
                />
              </label>
              <label className="min-w-0 text-small font-semibold">
                Check-out
                <input
                  type="date"
                  value={validDate(to) ? to : ""}
                  min={
                    validDate(from) && from >= dateKey()
                      ? addDays(from, 1)
                      : addDays(dateKey(), 1)
                  }
                  onChange={(event) => update("to", event.target.value)}
                  aria-invalid={Boolean(dateError)}
                  aria-describedby="date-hint"
                  className="mt-1 h-11 w-full min-w-0 rounded-lg border border-border bg-surface px-2 text-body font-normal"
                />
              </label>
            </div>
          </details>
          <label className={`${fieldClass} min-w-0 lg:order-4`}>
            <span className="sr-only">Guests</span>
            <Icon name="user" />
            <GuestSelect
              value={guests}
              onChange={(value) => update("guests", value || "")}
              allowAny
              describedBy="guest-hint"
              className={selectClass}
            />
          </label>
        </div>
        <p
          id="search-hint"
          role="status"
          className={
            tooShort
              ? "col-span-2 text-caption text-muted lg:order-5 lg:col-span-3"
              : "sr-only"
          }
        >
          {tooShort ? messages.shortSearch : ""}
        </p>
        <p
          id="guest-hint"
          role="status"
          className="col-span-2 text-small text-danger lg:order-6 lg:col-span-3"
        >
          {guestError}
        </p>
        <p
          id="date-hint"
          role="status"
          className="col-span-2 text-small text-danger lg:order-6 lg:col-span-3"
        >
          {dateError}
        </p>
      </form>
      {!dateError && !guestError && (
        <VenueResults
          key={String(datesSelected)}
          order={order}
          filters={{ q, guests, amenities, from, to }}
          waiting={waiting}
          tooShort={tooShort}
        />
      )}
    </section>
  );
}

/**
 * Loads the complete venue pool and applies shared photo, filter and sort rules.
 * @param {object} props Component props.
 * @param {string} props.order Selected venue sort key.
 * @param {object} props.filters Text, dates, capacity and amenity filters.
 * @param {boolean} props.waiting Indicates that debounced text is not yet applied.
 * @param {boolean} props.tooShort Indicates fewer than three search characters.
 * @returns {import('react').ReactNode}
 */
function VenueResults({ order, filters, waiting, tooShort }) {
  const [venues, setVenues] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  const bookings = Boolean(filters.from && filters.to);
  useEffect(() => {
    const controller = new AbortController();
    getAllVenues({ owner: true, bookings, signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setVenues(data.filter(hasVenuePhoto));
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      });
    return () => controller.abort();
  }, [bookings, attempt]);

  if (tooShort) return null;
  if (waiting)
    return (
      <p role="status" className="mt-6">
        Waiting for your search…
      </p>
    );
  if (error)
    return (
      <div className="mt-6 space-y-4">
        <p role="alert" className="text-danger">
          {error}
        </p>
        <button
          type="button"
          onClick={() => {
            setError("");
            setAttempt((value) => value + 1);
          }}
          className={buttonClass}
        >
          Try again
        </button>
      </div>
    );
  if (!venues) return <Loading className="mt-6">Loading stays…</Loading>;
  const matches = sortVenues(filterVenues(venues, filters), order);
  return (
    <VenueMatches
      key={JSON.stringify([order, filters])}
      venues={matches}
      onImageError={(id) =>
        setVenues((previous) => previous.filter((venue) => venue.id !== id))
      }
    />
  );
}

/**
 * Shows fifteen matching venue cards at a time and removes failed cover images.
 * @param {object} props Component props.
 * @param {object[]} props.venues Venue records to display.
 * @param {Function} props.onImageError Reports a failed cover image.
 * @returns {import('react').ReactNode}
 */
function VenueMatches({ venues, onImageError }) {
  const [count, setCount] = useState(15);
  const visible = venues.slice(0, count);
  return (
    <>
      <p
        role="status"
        className={`mt-6 text-small text-muted ${venues.length ? "" : "empty-state"}`}
      >
        {venues.length
          ? `Showing ${visible.length} of ${venues.length} matching stays.`
          : "No stays match your search and filters. Try adjusting them."}
      </p>
      {visible.length > 0 && (
        <div className="card-grid mt-6 gap-6 lg:grid-cols-3">
          {visible.map((venue) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              onImageError={onImageError}
            />
          ))}
        </div>
      )}
      {visible.length < venues.length && (
        <button
          type="button"
          onClick={() => setCount((value) => value + 15)}
          className={`${buttonClass} mt-6`}
        >
          Load more
        </button>
      )}
    </>
  );
}
