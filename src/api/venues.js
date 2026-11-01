import { apiRequest } from './client.js';
import { bookedPeriods, overlaps, validDate, dateKey } from '../utils/availability.js';

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

export function getVenues({ q = '', page = 1, order = 'newest', limit = 15, bookings = false, owner = false, signal } = {}) {
  const { sort, sortOrder } = venueSorts[order] ?? venueSorts.newest;
  return apiRequest(q ? 'holidaze/venues/search' : 'holidaze/venues', {
    query: { q: q || undefined, page, limit, sort, sortOrder, _bookings: bookings || undefined, _owner: owner || undefined }, signal,
  });
}

export async function getAllVenues({ q = '', bookings = false, owner = false, signal } = {}) {
  let result = null;
  let page = 1;
  do {
    signal?.throwIfAborted();
    const next = await getVenues({ q, page, limit: 100, bookings, owner, signal });
    result = appendVenuePage(result, next);
    page = next.meta.nextPage;
  } while (page);
  return result.data;
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

export function appendVenuePage(previous, next) {
  return {
    ...next,
    data: [...new Map([...(previous?.data ?? []), ...next.data].map(venue => [venue.id, venue])).values()],
  };
}
