import { messages } from "../../constants/messages.js";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { amenityOptions } from "./amenityOptions.js";
import AmenityPill from "./AmenityPill.jsx";
import Icon from "../Icon.jsx";
import VenueImage from "./VenueImage.jsx";
import VenueMapBoundary from "./VenueMapBoundary.jsx";
import { validMediaUrl } from "../../utils/media.js";

const fieldClass =
  "mt-1 w-full min-w-0 rounded-lg border border-border bg-surface px-3 text-body font-normal";
const inputClass = `${fieldClass} h-11`;
const sectionClass =
  "min-w-0 space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-6";

/**
 * Shares venue creation/editing fields, image rows, amenities and coordinate selection.
 * @param {object} props Component props.
 * @param {Function} props.onSave Saves validated input or receives saved data.
 * @param {Function} props.onCancel Returns without saving.
 * @param {object} [props.venue] Venue data.
 * @returns {import('react').ReactNode}
 */
export default function VenueForm({ onSave, onCancel, venue = {} }) {
  const editing = Boolean(venue.id);
  const [mediaKeys, setMediaKeys] = useState(() =>
    Array.from(
      { length: Math.max(1, venue.media?.length ?? 0) },
      (_, index) => index,
    ),
  );
  const nextKey = useRef(mediaKeys.length);
  const submitting = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const [coordinates, setCoordinates] = useState(() => ({
    lat: venue.location?.lat || venue.location?.lng ? venue.location.lat : "",
    lng: venue.location?.lat || venue.location?.lng ? venue.location.lng : "",
  }));
  const [amenities, setAmenities] = useState(() =>
    amenityOptions
      .filter((item) => venue.meta?.[item.key])
      .map((item) => item.key),
  );

  /**
   * Moves a stable photo row one position, keeping its fields and preview together.
   * @param {number} index Current photo position.
   * @param {number} direction One position up (-1) or down (1).
   * @returns {void}
   */
  function movePhoto(index, direction) {
    setMediaKeys((keys) => {
      const target = index + direction;
      if (target < 0 || target >= keys.length) return keys;
      const reordered = [...keys];
      [reordered[index], reordered[target]] = [
        reordered[target],
        reordered[index],
      ];
      return reordered;
    });
  }

  /**
   * Sends FormData to the page save handler and blocks duplicate or uncertain saves.
   * @param {import('react').SubmitEvent<HTMLFormElement>} event Form submission event.
   * @returns {Promise<void>}
   */
  async function submit(event) {
    event.preventDefault();
    if (submitting.current || uncertain) return;
    const form = new FormData(event.currentTarget);
    submitting.current = true;
    setPending(true);
    setError("");
    try {
      await onSave(form);
    } catch (error) {
      setError(error.message);
      setUncertain(Boolean(error.venueUncertain));
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      aria-label={editing ? "Edit venue" : "Create venue"}
      className="min-w-0 space-y-5 text-small"
    >
      <fieldset disabled={pending || uncertain} className="min-w-0 space-y-5">
        <legend className="sr-only">Venue information</legend>
        <section className={sectionClass} aria-labelledby="venue-basics">
          <h2 id="venue-basics" className="text-h3 font-semibold">
            About your venue
          </h2>
          <p className="text-small text-muted">
            Name, description, price and guest capacity are required.
          </p>
          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="min-w-0 space-y-4">
              <label className="block text-small font-semibold">
                Venue name
                <input
                  name="name"
                  defaultValue={venue.name ?? ""}
                  required
                  className={inputClass}
                />
              </label>
              <label className="block text-small font-semibold">
                Description
                <textarea
                  name="description"
                  defaultValue={venue.description ?? ""}
                  required
                  rows={4}
                  className={`${fieldClass} min-h-11 py-3`}
                />
              </label>
            </div>
            <div className="min-w-0 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block min-w-0 text-small font-semibold">
                  Price per night (NOK)
                  <input
                    name="price"
                    defaultValue={venue.price ?? ""}
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    className={inputClass}
                  />
                </label>
                <label className="block min-w-0 text-small font-semibold">
                  Maximum guests
                  <input
                    name="maxGuests"
                    defaultValue={venue.maxGuests ?? ""}
                    type="number"
                    required
                    min="1"
                    step="1"
                    inputMode="numeric"
                    className={inputClass}
                  />
                </label>
                <label className="block min-w-0 text-small font-semibold">
                  Rating (0–5)
                  <input
                    name="rating"
                    defaultValue={venue.rating ?? 0}
                    type="number"
                    min="0"
                    max="5"
                    step="any"
                    inputMode="decimal"
                    className={inputClass}
                  />
                </label>
              </div>
              <div
                role="group"
                aria-labelledby="venue-amenities"
                className="space-y-3"
              >
                <h3 id="venue-amenities" className="font-semibold">
                  Amenities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {amenityOptions.map((item) => (
                    <AmenityPill
                      key={item.key}
                      item={item}
                      selected={amenities.includes(item.key)}
                      onClick={() =>
                        setAmenities((values) =>
                          values.includes(item.key)
                            ? values.filter((key) => key !== item.key)
                            : [...values, item.key],
                        )
                      }
                    />
                  ))}
                  {amenities.map((key) => (
                    <input key={key} type="hidden" name={key} value="true" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className={sectionClass} aria-labelledby="venue-images">
          <h2 id="venue-images" className="text-h3 font-semibold">
            Photos
          </h2>
          <p className="text-small text-muted">
            Optional. Use public HTTP or HTTPS image URLs. The first image is
            the cover photo.
          </p>
          {mediaKeys.map((key, index) => (
            <VenuePhotoRow
              key={key}
              media={venue.media?.[key]}
              index={index}
              total={mediaKeys.length}
              onMove={(direction) => movePhoto(index, direction)}
              onRemove={() =>
                setMediaKeys((keys) => keys.filter((value) => value !== key))
              }
            />
          ))}
          <button
            type="button"
            onClick={() => {
              const key = nextKey.current++;
              setMediaKeys((keys) => [...keys, key]);
            }}
            className="navigation-link gap-2"
          >
            <Icon name="plus" />
            Add image
          </button>
        </section>
        <section className={sectionClass} aria-labelledby="venue-location">
          <h2 id="venue-location" className="text-h3 font-semibold">
            Location
          </h2>
          <div className="grid min-w-0 items-start gap-6 lg:grid-cols-2">
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              {[
                ["address", "Street address"],
                ["zip", "Postal code"],
                ["city", "City"],
                ["country", "Country"],
                ["continent", "Continent"],
              ].map(([name, label]) => (
                <label
                  key={name}
                  className={`block min-w-0 text-small font-semibold ${name === "address" ? "sm:col-span-2" : ""}`}
                >
                  {label}
                  <input
                    name={name}
                    defaultValue={venue.location?.[name] ?? ""}
                    className={inputClass}
                  />
                </label>
              ))}
              <label className="block min-w-0 text-small font-semibold">
                Latitude
                <input
                  name="lat"
                  type="number"
                  min="-90"
                  max="90"
                  step="any"
                  value={coordinates.lat}
                  onChange={(event) =>
                    setCoordinates((value) => ({
                      ...value,
                      lat: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </label>
              <label className="block min-w-0 text-small font-semibold">
                Longitude
                <input
                  name="lng"
                  type="number"
                  min="-180"
                  max="180"
                  step="any"
                  value={coordinates.lng}
                  onChange={(event) =>
                    setCoordinates((value) => ({
                      ...value,
                      lng: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </label>
            </div>
            <VenueMapBoundary
              {...coordinates}
              onChange={setCoordinates}
              disabled={pending || uncertain}
            />
          </div>
        </section>
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="h-11 rounded-lg bg-primary px-5 font-semibold text-surface hover:bg-primary-hover disabled:opacity-60"
          >
            {pending
              ? editing
                ? "Saving…"
                : "Creating…"
              : editing
                ? "Save changes"
                : "Create venue"}
          </button>
          <button type="button" onClick={onCancel} className="navigation-link">
            Cancel
          </button>
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="whitespace-pre-line text-danger">
          {error}
        </p>
      )}
      {uncertain && (
        <div role="status" className="space-y-2 text-muted">
          <p>{messages.venueCreationUncertain}</p>
          <Link to="/manager/venues" className="navigation-link">
            My venues
          </Link>
        </div>
      )}
    </form>
  );
}

/**
 * Edits one photo URL and alt text, with an explicit thumbnail preview and removal action.
 * @param {object} props Component props.
 * @param {object} [props.media] Existing photo URL and alt text.
 * @param {number} props.index Current zero-based position in the photo list.
 * @param {number} props.total Number of photo rows.
 * @param {Function} props.onMove Moves this row up or down.
 * @param {Function} props.onRemove Removes this photo row.
 * @returns {import('react').ReactNode}
 */
function VenuePhotoRow({ media, index, total, onMove, onRemove }) {
  const urlInput = useRef(null);
  const altInput = useRef(null);
  const [preview, setPreview] = useState(() => ({ ...media, revision: 0 }));
  const title = `Image ${index + 1}`;

  /**
   * Validates the entered URL and refreshes only this row's thumbnail, without saving.
   * @returns {void}
   */
  function showPreview() {
    const input = urlInput.current;
    const url = input.value.trim();
    input.setCustomValidity(
      url && !validMediaUrl(url) ? messages.invalidImageUrl(index + 1) : "",
    );
    if (!input.reportValidity()) return;
    setPreview((previous) => ({
      url,
      alt: altInput.current.value,
      revision: previous.revision + 1,
    }));
  }

  return (
    <fieldset className="min-w-0 border-t border-border pt-4 first-of-type:border-0 first-of-type:pt-0">
      <legend className="sr-only">{title}</legend>
      <div className="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)_auto] items-start gap-2 min-[375px]:grid-cols-[2.5rem_minmax(0,1fr)_auto] lg:grid-cols-[6rem_minmax(0,1fr)_6rem] lg:gap-x-4 lg:gap-y-2">
        <VenueImage
          key={preview.revision}
          media={preview}
          name={title}
          fallback={
            <span role="img" aria-label="Image preview unavailable">
              <Icon name="image" className="size-6 text-primary/50" />
            </span>
          }
          className="col-start-1 row-start-1 h-10 rounded-lg text-caption lg:row-span-2 lg:h-24"
        />
        <p className="col-start-2 row-start-1 min-w-0 self-start font-semibold">
          {title}
          {index === 0 && (
            <span className="block text-caption font-normal text-muted">
              Cover photo
            </span>
          )}
        </p>
        <div className="col-span-full row-start-2 grid min-w-0 items-end gap-3 lg:col-span-1 lg:col-start-2 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <label className="block min-w-0 text-small font-semibold">
            Image URL
            <input
              ref={urlInput}
              name="mediaUrl"
              defaultValue={media?.url ?? ""}
              type="url"
              maxLength={300}
              onInput={(event) => event.currentTarget.setCustomValidity("")}
              className={inputClass}
            />
          </label>
          <label className="block min-w-0 text-small font-semibold">
            Alt text
            <input
              ref={altInput}
              name="mediaAlt"
              defaultValue={media?.alt ?? ""}
              maxLength={120}
              className={inputClass}
            />
          </label>
        </div>
        <div className="col-start-3 row-start-1 grid grid-cols-4 lg:row-span-2 lg:grid-cols-2 lg:gap-2">
          <button
            type="button"
            onClick={showPreview}
            aria-label={`Preview image ${index + 1}`}
            title="Preview image from URL"
            className="navigation-link h-11 w-8 shrink-0 justify-center p-0 min-[375px]:w-11 lg:col-start-1 lg:row-start-2 lg:w-11"
          >
            <Icon name="image" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove image ${index + 1}`}
            title="Remove image"
            className="inline-flex h-11 w-8 shrink-0 min-[375px]:w-11 lg:col-start-2 lg:row-start-2 lg:w-11 items-center justify-center rounded-lg border border-border text-danger hover:bg-danger/10"
          >
            <Icon name="trash" />
          </button>
          {[-1, 1].map((direction) => (
            <button
              key={direction}
              type="button"
              onClick={() => onMove(direction)}
              disabled={direction === -1 ? index === 0 : index === total - 1}
              aria-label={`Move image ${index + 1} ${direction === -1 ? "up" : "down"}`}
              title={`Move image ${direction === -1 ? "up" : "down"}`}
              className={`navigation-link h-11 w-8 shrink-0 justify-center p-0 disabled:opacity-40 min-[375px]:w-11 lg:w-11 lg:row-start-1 ${direction === -1 ? "lg:col-start-1" : "lg:col-start-2"}`}
            >
              <Icon
                name="right"
                className={`size-5 ${direction === -1 ? "-rotate-90" : "rotate-90"}`}
              />
            </button>
          ))}
        </div>
      </div>
    </fieldset>
  );
}
