export async function getHostProfile(request, name, { signal } = {}) {
  const path = `holidaze/profiles/${encodeURIComponent(name)}`;
  const { data: profile } = await request(path, { signal });
  const venues = await getProfileVenues(request, name, { signal });
  return { profile, venues };
}

export function getProfileVenues(request, name, { bookings = false, signal } = {}) {
  return getAllPages(request, `holidaze/profiles/${encodeURIComponent(name)}/venues`, {
    query: { sort: 'created', sortOrder: 'desc', ...(bookings && { _bookings: true }) }, signal,
  });
}
import { getAllPages } from './client.js';

