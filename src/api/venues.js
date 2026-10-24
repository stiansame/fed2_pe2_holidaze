import { apiRequest } from './client.js';

export function getVenue(id, { signal } = {}) {
  return apiRequest(`holidaze/venues/${encodeURIComponent(id)}`, {
    query: { _owner: true }, signal,
  });
}

export const venueSorts = {
  newest: { label: 'Newest first', sort: 'created', sortOrder: 'desc' },
  'price-asc': { label: 'Price: low to high', sort: 'price', sortOrder: 'asc' },
  'price-desc': { label: 'Price: high to low', sort: 'price', sortOrder: 'desc' },
  'name-asc': { label: 'Name: A–Z', sort: 'name', sortOrder: 'asc' },
  'name-desc': { label: 'Name: Z–A', sort: 'name', sortOrder: 'desc' },
};

export function getVenues({ q = '', page = 1, order = 'newest', limit = 15, signal } = {}) {
  const { sort, sortOrder } = venueSorts[order] ?? venueSorts.newest;
  return apiRequest(q ? 'holidaze/venues/search' : 'holidaze/venues', {
    query: { q: q || undefined, page, limit, sort, sortOrder }, signal,
  });
}

export async function getAllVenues({ q = '', signal } = {}) {
  let result = null;
  let page = 1;
  do {
    signal?.throwIfAborted();
    const next = await getVenues({ q, page, limit: 100, signal });
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

export function filterVenues(venues, { guests = 0, amenities = [] } = {}) {
  return venues.filter(venue => (!guests || venue.maxGuests >= guests)
    && amenities.every(key => venue.meta?.[key] === true));
}

export function appendVenuePage(previous, next) {
  return {
    ...next,
    data: [...new Map([...(previous?.data ?? []), ...next.data].map(venue => [venue.id, venue])).values()],
  };
}
