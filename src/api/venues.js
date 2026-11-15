import { messages } from "../constants/messages.js";
import { apiRequest, ApiError, getAllPages } from "./client.js";
import { venueFormData } from "../utils/venueValidation.js";
import {
  bookedPeriods,
  overlaps,
  validDate,
  dateKey,
} from "../utils/availability.js";

const venueCache = new Map();

/**
 * Invalidates cached venue lists before venue or booking changes.
 * @returns {void}
 */
export function clearVenueCache() {
  venueCache.clear();
}

/**
 * Validates and creates one venue, marking uncertain responses to prevent duplicate saves.
 * @param {Function} request Request function supplied by the API client or account provider.
 * @param {FormData} form Completed venue form.
 * @returns {Promise<object>}
 */
export async function createVenue(request, form) {
  const body = venueFormData(form);
  clearVenueCache();
  try {
    const { data } = await request("holidaze/venues", { method: "POST", body });
    if (!data?.id) throw new ApiError(messages.missingVenueReference);
    return data;
  } catch (error) {
    // A lost response can follow a saved venue. Never retry POST automatically.
    error.venueUncertain =
      !error.status ||
      error.status >= 500 ||
      (error.status >= 200 && error.status < 300);
    throw error;
  }
}

/**
 * Loads a venue and checks that it belongs to the signed-in account.
 * @param {Function} request Request function supplied by the API client or account provider.
 * @param {string} id Record ID.
 * @param {string} name Signed-in account name.
 * @param {object} [options={}] Optional request settings.
 * @param {AbortSignal} [options.signal] Cancels an obsolete request.
 * @returns {Promise<object>}
 * @throws {Error} If the account does not own the venue.
 */
export async function getOwnVenue(request, id, name, { signal } = {}) {
  const { data } = await request(`holidaze/venues/${encodeURIComponent(id)}`, {
    query: { _owner: true },
    signal,
  });
  if (!name || data?.owner?.name !== name)
    throw new Error(messages.venueAccessDenied);
  return data;
}

/**
 * Checks ownership before deleting a venue and invalidating cached lists.
 * @param {Function} request Request function supplied by the API client or account provider.
 * @param {string} id Record ID.
 * @param {string} name Signed-in account name.
 * @returns {Promise<void>}
 */
export async function deleteVenue(request, id, name) {
  await getOwnVenue(request, id, name);
  clearVenueCache();
  await request(`holidaze/venues/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

/**
 * Validates and saves an owned venue, explicitly clearing removed location fields.
 * @param {Function} request Request function supplied by the API client or account provider.
 * @param {string} id Record ID.
 * @param {string} name Signed-in account name.
 * @param {FormData} form Updated venue form.
 * @returns {Promise<object>}
 */
export async function updateVenue(request, id, name, form) {
  const body = venueFormData(form);
  // Send empty values explicitly so removed location fields are cleared.
  body.location = {
    address: "",
    city: "",
    zip: "",
    country: "",
    continent: "",
    lat: 0,
    lng: 0,
    ...body.location,
  };
  await getOwnVenue(request, id, name);
  clearVenueCache();
  const { data } = await request(`holidaze/venues/${encodeURIComponent(id)}`, {
    method: "PUT",
    body,
  });
  if (data?.id !== id) throw new Error(messages.venueUpdateUnconfirmed);
  return data;
}

/**
 * Loads one venue with its owner and booking data.
 * @param {string} id Venue ID.
 * @param {object} [options={}] Optional request settings.
 * @param {AbortSignal} [options.signal] Cancels an obsolete request.
 * @returns {Promise<object>}
 */
export function getVenue(id, { signal } = {}) {
  return apiRequest(`holidaze/venues/${encodeURIComponent(id)}`, {
    query: { _owner: true, _bookings: true },
    signal,
  });
}

export const venueSorts = {
  newest: { label: "Newest first", sort: "created", sortOrder: "desc" },
  "price-asc": { label: "Price: low to high", sort: "price", sortOrder: "asc" },
  "price-desc": {
    label: "Price: high to low",
    sort: "price",
    sortOrder: "desc",
  },
  "name-asc": { label: "Name: A–Z", sort: "name", sortOrder: "asc" },
  "name-desc": { label: "Name: Z–A", sort: "name", sortOrder: "desc" },
};

/**
 * Loads complete venue lists and caches successful results for two minutes per data variant.
 * @param {object} [options={}] Related data and cancellation settings.
 * @param {boolean} [options.bookings=false] Includes booking data for date filtering.
 * @param {boolean} [options.owner=false] Includes owner data for text search.
 * @param {AbortSignal} [options.signal] Cancels the load.
 * @returns {Promise<object[]>}
 */
export async function getAllVenues({
  bookings = false,
  owner = false,
  signal,
} = {}) {
  signal?.throwIfAborted();
  const key = `${Boolean(bookings)}:${Boolean(owner)}`;
  const cached = venueCache.get(key);
  if (cached && Date.now() - cached.savedAt < 120_000) return cached.venues;
  const result = await getAllPages(apiRequest, "holidaze/venues", {
    query: {
      sort: "created",
      sortOrder: "desc",
      _bookings: bookings || undefined,
      _owner: owner || undefined,
    },
    signal,
  });
  // Cache only complete lists; date searches need their own booking data.
  venueCache.set(key, { venues: result, savedAt: Date.now() });
  return result;
}

/**
 * Sorts a copy of the venue list using a supported name, price or creation-date order.
 * @param {object[]} venues Venues to sort.
 * @param {string} [order="newest"] Key from venueSorts.
 * @returns {object[]}
 */
export function sortVenues(venues, order = "newest") {
  const { sort, sortOrder } = venueSorts[order] ?? venueSorts.newest;
  const direction = sortOrder === "asc" ? 1 : -1;
  return [...venues].sort(
    (a, b) =>
      direction *
      (sort === "name"
        ? (a.name ?? "").localeCompare(b.name ?? "", "en")
        : sort === "price"
          ? a.price - b.price
          : Date.parse(a.created) - Date.parse(b.created)),
  );
}

/**
 * Combines text, capacity, amenity and reliable date-availability filters.
 * @param {object[]} venues Complete venue pool.
 * @param {object} [filters={}] Search selections.
 * @param {string} [filters.q=""] Text matched against venue, location and owner.
 * @param {number} [filters.guests=0] Minimum guest capacity; zero leaves capacity unrestricted.
 * @param {string[]} [filters.amenities=[]] Required amenity keys.
 * @param {string} [filters.from=""] Check-in date in YYYY-MM-DD format.
 * @param {string} [filters.to=""] Check-out date in YYYY-MM-DD format.
 * @returns {object[]}
 */
export function filterVenues(
  venues,
  { q = "", guests = 0, amenities = [], from = "", to = "" } = {},
) {
  const query = q.trim().toLowerCase();
  const dates = Boolean(from || to);
  if (
    dates &&
    (!validDate(from) || !validDate(to) || from < dateKey() || to <= from)
  )
    return [];
  return venues.filter((venue) => {
    if (
      query &&
      ![
        venue.name,
        venue.description,
        venue.owner?.name,
        ...Object.values(venue.location ?? {}),
      ].some(
        (value) =>
          typeof value === "string" && value.toLowerCase().includes(query),
      )
    )
      return false;
    if (
      (guests && !(venue.maxGuests >= guests)) ||
      !amenities.every((key) => venue.meta?.[key] === true)
    )
      return false;
    if (!dates) return true;
    const { periods, reliable } = bookedPeriods(venue.bookings);
    return reliable && !overlaps(from, to, periods);
  });
}
