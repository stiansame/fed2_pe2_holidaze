export async function getHostProfile(request, name, { signal } = {}) {
  const path = `holidaze/profiles/${encodeURIComponent(name)}`;
  const { data: profile } = await request(path, { signal });
  const venues = await getProfileVenues(request, name, { signal });
  return { profile, venues };
}

export async function getProfileVenues(request, name, { bookings = false, signal } = {}) {
  const path = `holidaze/profiles/${encodeURIComponent(name)}/venues`;
  const venues = new Map();
  let page = 1;
  do {
    signal?.throwIfAborted();
    const { data, meta } = await request(path, {
      query: { page, limit: 100, sort: 'created', sortOrder: 'desc', ...(bookings && { _bookings: true }) }, signal,
    });
    for (const venue of data) venues.set(venue.id, venue);
    page = meta?.nextPage;
  } while (page);
  return [...venues.values()];
}
