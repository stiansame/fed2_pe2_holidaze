export async function getHostProfile(request, name, { signal } = {}) {
  const path = `holidaze/profiles/${encodeURIComponent(name)}`;
  const { data: profile } = await request(path, { signal });
  const venues = new Map();
  let page = 1;
  do {
    signal?.throwIfAborted();
    const { data, meta } = await request(`${path}/venues`, {
      query: { page, limit: 100, sort: 'created', sortOrder: 'desc' }, signal,
    });
    for (const venue of data) venues.set(venue.id, venue);
    page = meta?.nextPage;
  } while (page);
  return { profile, venues: [...venues.values()] };
}
