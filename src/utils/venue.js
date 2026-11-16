const priceFormat = new Intl.NumberFormat("nb-NO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Checks whether a value has the HTTP(S) URL shape used for photo selection.
 * @param {string} [url] Possible photo URL.
 * @returns {boolean}
 */
function isPhotoUrl(url) {
  return /^https?:\/\/\S+$/i.test(url?.trim() ?? "");
}

/**
 * Checks that the first venue photo has a usable URL shape; it does not load the image.
 * @param {object} venue Venue with optional media.
 * @returns {boolean}
 */
export function hasVenuePhoto(venue) {
  return isPhotoUrl(venue.media?.[0]?.url);
}

/**
 * Randomises venues rated above 4.5 with map coordinates and two distinct photo URLs.
 * @param {object[]} venues Venue pool.
 * @param {function(): number} [random=Math.random] Random-number source between zero and one.
 * @returns {object[]}
 */
export function selectHighlyRatedVenues(venues, random = Math.random) {
  const pool = venues.filter(
    (venue) =>
      hasVenuePhoto(venue) &&
      venue.rating > 4.5 &&
      venueMapLinks(venue.location) &&
      new Set(
        (venue.media ?? [])
          .map((photo) => photo?.url?.trim())
          .filter(isPhotoUrl),
      ).size >= 2,
  );
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

/**
 * Adds the nightly label to a formatted price, or supplies a missing-price message.
 * @param {number} price Nightly rate.
 * @returns {string}
 */
export function formatVenuePrice(price) {
  return Number.isFinite(price)
    ? `${formatPrice(price)} / night`
    : "Price not specified";
}

/**
 * Formats NOK amounts with separators and ,- for whole amounts.
 * @param {number} price Amount to format.
 * @returns {string}
 */
export function formatPrice(price) {
  return `NOK ${priceFormat.format(price).replace(/,00$/, ",-")}`;
}

/**
 * Builds a map link for supported coordinates, rejecting the API zero/zero default.
 * @param {object} [location] Venue latitude and longitude.
 * @returns {{full: string}|null}
 */
export function venueMapLinks(location) {
  const { lat, lng } = location ?? {};
  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    Math.abs(lat) > 85 ||
    Math.abs(lng) > 180 ||
    (lat === 0 && lng === 0)
  )
    return null;
  return {
    full: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`,
  };
}

/**
 * Formats the venue city and country with a shared missing-location fallback.
 * @param {object} [location] Venue location.
 * @returns {string}
 */
export function formatLocation(location) {
  return [location?.city, location?.country]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(", ") || "Location not specified";
}
