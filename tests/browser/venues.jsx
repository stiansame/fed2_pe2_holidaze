// Local browser fixtures: /tests/browser/venues.html?path=/venues&mode=data
// Modes: data, empty, broken (all main photos fail), error/network (retry succeeds).
// The real pages run unchanged; fixture requests never reach Noroff.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import App from '../../src/App.jsx';
import { AuthContext } from '../../src/auth/AuthContext.js';
import '../../src/styles/index.css';

const params = new URLSearchParams(location.search);
const mode = params.get('mode') || 'data';
const photo = `${location.origin}/src/assets/host-placeholder.svg`;
const venues = Array.from({ length: 18 }, (_, i) => ({
  id: `test-${i}`, name: i === 0 ? 'LongVenueName'.repeat(20) : `Test stay ${i}`,
  description: i ? 'DescriptionWithoutSpaces'.repeat(30) : ' ', price: i ? 1490 : null,
  maxGuests: i ? 6 : null, rating: i ? 5 : 0, created: `2026-10-${String(24 - i).padStart(2, '0')}`,
  media: i === 0 ? [] : [{ url: i === 1 || mode === 'broken' ? `${location.origin}/missing-photo.jpg` : photo }, { url: `${location.origin}/src/assets/holidaze-mark.svg` }],
  location: i === 0 ? null : i === 1 ? { city: ' ', country: ' ' } : { city: 'LongLocation'.repeat(15), country: 'Norway', lat: 0, lng: 0 },
  meta: i ? { wifi: true, parking: true, breakfast: true, pets: true } : null,
  owner: i === 0 ? null : { name: 'LongHostName'.repeat(15), avatar: { url: '/missing-avatar.jpg' } },
}));
let requests = 0;

globalThis.fetch = async (input, { signal } = {}) => {
  signal?.throwIfAborted();
  const url = new URL(input);
  if (url.origin !== 'https://v2.api.noroff.dev' || !url.pathname.startsWith('/holidaze/venues')) {
    throw new Error('Only fixture venue requests are allowed.');
  }
  // StrictMode cancels its first effect. Check cancellation before counting a failure.
  await new Promise(resolve => setTimeout(resolve, 100));
  signal?.throwIfAborted();
  const fail = ++requests === 1;
  if (fail && mode === 'network') throw new TypeError('Fixture network failure');
  if (fail && mode === 'error') return Response.json({ errors: [{ message: 'Fixture service unavailable.' }] }, { status: 503 });
  const id = url.pathname.split('/')[3];
  if (id && id !== 'search') {
    const venue = venues.find(item => item.id === id);
    return venue ? Response.json({ data: venue }) : Response.json({ errors: [{ message: 'Not found' }] }, { status: 404 });
  }
  const q = url.searchParams.get('q')?.toLowerCase();
  const data = mode === 'empty' ? [] : venues.filter(venue => !q || venue.name.toLowerCase().includes(q));
  return Response.json({ data, meta: { nextPage: null, totalCount: data.length } });
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MemoryRouter initialEntries={[params.get('path') || '/venues']}>
      <AuthContext.Provider value={{ user: null }}><App /></AuthContext.Provider>
    </MemoryRouter>
  </StrictMode>,
);
