import { apiRequest } from './client.js';

export function getVenues({ q = '', page = 1, signal } = {}) {
  return apiRequest(q ? 'holidaze/venues/search' : 'holidaze/venues', {
    query: { q: q || undefined, page, limit: 12, sort: 'created', sortOrder: 'desc' }, signal,
  });
}

export function appendVenuePage(previous, next) {
  return {
    ...next,
    data: [...new Map([...(previous?.data ?? []), ...next.data].map(venue => [venue.id, venue])).values()],
  };
}
