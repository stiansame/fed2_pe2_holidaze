import { apiRequest } from './client.js';

export const venueSorts = {
  newest: { label: 'Newest first', sort: 'created', sortOrder: 'desc' },
  'price-asc': { label: 'Price: low to high', sort: 'price', sortOrder: 'asc' },
  'price-desc': { label: 'Price: high to low', sort: 'price', sortOrder: 'desc' },
  'name-asc': { label: 'Name: A–Z', sort: 'name', sortOrder: 'asc' },
  'name-desc': { label: 'Name: Z–A', sort: 'name', sortOrder: 'desc' },
};

export function getVenues({ q = '', page = 1, order = 'newest', signal } = {}) {
  const { sort, sortOrder } = venueSorts[order] ?? venueSorts.newest;
  return apiRequest(q ? 'holidaze/venues/search' : 'holidaze/venues', {
    query: { q: q || undefined, page, limit: 15, sort, sortOrder }, signal,
  });
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
