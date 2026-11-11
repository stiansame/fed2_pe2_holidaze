import { messages } from '../constants/messages.js';
import { apiRequest, ApiError, getAllPages } from './client.js';
import { venueFormData } from '../utils/venueForm.js';
import { bookedPeriods, overlaps, validDate, dateKey } from '../utils/availability.js';

const venueCache = new Map();

export function clearVenueCache() {
  venueCache.clear();
}

export async function createVenue(request, form) {
  const body = venueFormData(form);
  clearVenueCache();
  try {
    const { data } = await request('holidaze/venues', { method: 'POST', body });
    if (!data?.id) throw new ApiError(messages.missingVenueReference);
    return data;
  } catch (error) {
    // A lost response can follow a saved venue. Never retry POST automatically.
    error.venueUncertain = !error.status || error.status >= 500 || (error.status >= 200 && error.status < 300);
    throw error;
  }
}

export async function getOwnVenue(request, id, name, { signal } = {}) {
  const { data } = await request(`holidaze/venues/${encodeURIComponent(id)}`, {
    query: { _owner: true }, signal,
  });
  if (!name || data?.owner?.name !== name) throw new Error(messages.venueAccessDenied);
  return data;
}

export async function deleteVenue(request, id, name) {
  await getOwnVenue(request, id, name);
  clearVenueCache();
  await request(`holidaze/venues/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function updateVenue(request, id, name, form) {
  const body = venueFormData(form);
  // Send empty values explicitly so removed location fields are cleared.
  body.location = { address: '', city: '', zip: '', country: '', continent: '', lat: 0, lng: 0, ...body.location };
  await getOwnVenue(request, id, name);
  clearVenueCache();
  const { data } = await request(`holidaze/venues/${encodeURIComponent(id)}`, { method: 'PUT', body });
  if (data?.id !== id) throw new Error(messages.venueUpdateUnconfirmed);
  return data;
}

export function getVenue(id, { signal } = {}) {
  return apiRequest(`holidaze/venues/${encodeURIComponent(id)}`, {
    query: { _owner: true, _bookings: true }, signal,
  });
}

export function getHighlyRatedVenues({ signal } = {}) {
  return apiRequest('holidaze/venues', {
    query: { sort: 'rating', sortOrder: 'desc', limit: 100 }, signal,
  });
}

export const venueSorts = {
  newest: { label: 'Newest first', sort: 'created', sortOrder: 'desc' },
  'price-asc': { label: 'Price: low to high', sort: 'price', sortOrder: 'asc' },
  'price-desc': { label: 'Price: high to low', sort: 'price', sortOrder: 'desc' },
  'name-asc': { label: 'Name: A–Z', sort: 'name', sortOrder: 'asc' },
  'name-desc': { label: 'Name: Z–A', sort: 'name', sortOrder: 'desc' },
};

export async function getAllVenues({ bookings = false, owner = false, signal } = {}) {
  signal?.throwIfAborted();
  const key = `${Boolean(bookings)}:${Boolean(owner)}`;
  const cached = venueCache.get(key);
  if (cached && Date.now() - cached.savedAt < 120_000) return cached.venues;
  const result = await getAllPages(apiRequest, 'holidaze/venues', {
    query: { sort: 'created', sortOrder: 'desc', _bookings: bookings || undefined, _owner: owner || undefined }, signal,
  });
  // Cache only complete lists; date searches need their own booking data.
  venueCache.set(key, { venues: result, savedAt: Date.now() });
  return result;
}

export function sortVenues(venues, order = 'newest') {
  const { sort, sortOrder } = venueSorts[order] ?? venueSorts.newest;
  const direction = sortOrder === 'asc' ? 1 : -1;
  return [...venues].sort((a, b) => direction * (sort === 'name'
    ? (a.name ?? '').localeCompare(b.name ?? '', 'en')
    : sort === 'price' ? a.price - b.price : Date.parse(a.created) - Date.parse(b.created)));
}

export function filterVenues(venues, { q = '', guests = 0, amenities = [], from = '', to = '' } = {}) {
  const query = q.trim().toLowerCase();
  const dates = Boolean(from || to);
  if (dates && (!validDate(from) || !validDate(to) || from < dateKey() || to <= from)) return [];
  return venues.filter(venue => {
    if (query && ![venue.name, venue.description, venue.owner?.name, ...Object.values(venue.location ?? {})]
      .some(value => typeof value === 'string' && value.toLowerCase().includes(query))) return false;
    if ((guests && !(venue.maxGuests >= guests)) || !amenities.every(key => venue.meta?.[key] === true)) return false;
    if (!dates) return true;
    const { periods, reliable } = bookedPeriods(venue.bookings);
    return reliable && !overlaps(from, to, periods);
  });
}
