// Local browser fixtures: /tests/browser/venues.html?path=/venues&mode=data
// Modes: data, empty, broken (all main photos fail), error/network (retry succeeds).
// The real pages run unchanged; fixture requests never reach Noroff.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import App from '../../src/App.jsx';
import AuthProvider from '../../src/auth/AuthProvider.jsx';
import { SESSION_KEY } from '../../src/auth/session.js';
import '../../src/styles/index.css';
import { addDays, dateKey } from '../../src/utils/availability.js';

const params = new URLSearchParams(location.search);
const mode = params.get('mode') || 'data';
const fixtureUser = { name: 'fixture_guest', email: 'fixture@stud.noroff.no', venueManager: false, accessToken: `fixture.${btoa(JSON.stringify({ exp: 9999999999 }))}.test` };
// Keep fixture sessions in memory; never touch the user's real saved session.
const fixtureStorage = new Map(params.get('signedIn') === '1' ? [[SESSION_KEY, JSON.stringify(fixtureUser)]] : []);
Object.defineProperty(window, 'localStorage', { value: {
  getItem: key => fixtureStorage.get(key) ?? null,
  setItem: (key, value) => fixtureStorage.set(key, value),
  removeItem: key => fixtureStorage.delete(key),
} });
const photo = `${location.origin}/src/assets/host-placeholder.svg`;
const venues = Array.from({ length: 18 }, (_, i) => ({
  id: `test-${i}`, name: i === 0 ? 'LongVenueName'.repeat(20) : `Test stay ${i}`,
  description: i ? 'DescriptionWithoutSpaces'.repeat(30) : ' ', price: i ? 1490 : null,
  maxGuests: i ? 6 : null, rating: i ? 5 : 0, created: `2026-10-${String(24 - i).padStart(2, '0')}`,
  media: i === 0 ? [] : [{ url: i === 1 || mode === 'broken' ? `${location.origin}/missing-photo.jpg` : photo }, { url: `${location.origin}/src/assets/holidaze-mark.svg` }],
  location: i === 0 ? null : i === 1 ? { city: ' ', country: ' ' } : { city: 'LongLocation'.repeat(15), country: 'Norway', lat: 0, lng: 0 },
  meta: i ? { wifi: true, parking: true, breakfast: true, pets: true } : null,
  owner: i === 0 ? null : { name: 'LongHostName'.repeat(15), avatar: { url: '/missing-avatar.jpg' } },
  bookings: mode === 'availability-missing' ? undefined : [{ dateFrom: `${addDays(dateKey(), 3)}T00:00:00Z`, dateTo: `${addDays(dateKey(), 6)}T00:00:00Z` }],
}));
let requests = 0;
let detailRequests = 0;
const savedBookings = new Map();
let confirmationRequests = 0;

globalThis.fetch = async (input, { signal, method = 'GET', body } = {}) => {
  signal?.throwIfAborted();
  const url = new URL(input);
  if (url.origin !== 'https://v2.api.noroff.dev' || !['/holidaze/venues', '/holidaze/bookings', '/auth/login'].some(path => url.pathname.startsWith(path))) {
    throw new Error('Only fixture requests are allowed.');
  }
  // StrictMode cancels its first effect. Check cancellation before counting a failure.
  await new Promise(resolve => setTimeout(resolve, 100));
  signal?.throwIfAborted();
  if (url.pathname === '/auth/login') return Response.json({ data: fixtureUser });
  if (url.pathname.startsWith('/holidaze/bookings')) {
    if (method === 'POST') {
      if (mode === 'booking-unauthorized') return Response.json({ errors: [{ message: 'Session expired' }] }, { status: 401 });
      if (mode === 'booking-error') return Response.json({ errors: [{ message: 'Fixture booking rejected.' }] }, { status: 400 });
      const values = JSON.parse(body);
      const venue = venues.find(item => item.id === values.venueId);
      const booking = { ...values, id: 'fixture-booking', customer: { name: fixtureUser.name }, venue: { ...venue, bookings: undefined } };
      savedBookings.set(booking.id, booking);
      venue.bookings.push(booking);
      if (mode === 'booking-uncertain') throw new TypeError('Fixture response lost after saving');
      return Response.json({ data: booking }, { status: 201 });
    }
    if (mode === 'confirmation-error' && ++confirmationRequests === 1) return Response.json({ errors: [{ message: 'Fixture confirmation unavailable.' }] }, { status: 503 });
    const booking = savedBookings.get(url.pathname.split('/')[3]);
    return booking ? Response.json({ data: booking }) : Response.json({ errors: [{ message: 'Booking not found' }] }, { status: 404 });
  }
  const fail = ++requests === 1;
  if (fail && mode === 'network') throw new TypeError('Fixture network failure');
  if (fail && mode === 'error') return Response.json({ errors: [{ message: 'Fixture service unavailable.' }] }, { status: 503 });
  const id = url.pathname.split('/')[3];
  if (id && id !== 'search') {
    const venue = venues.find(item => item.id === id);
    detailRequests++;
    // StrictMode's aborted request is excluded, so the second detail load is the final preflight.
    if (venue && detailRequests > 1 && mode === 'booking-price') venue.price = 1600;
    if (venue && detailRequests > 1 && mode === 'booking-conflict') venue.bookings = [{ dateFrom: '2090-03-25', dateTo: '2090-03-28' }];
    return venue ? Response.json({ data: venue }) : Response.json({ errors: [{ message: 'Not found' }] }, { status: 404 });
  }
  const q = url.searchParams.get('q')?.toLowerCase();
  const data = mode === 'empty' ? [] : venues.filter(venue => !q || venue.name.toLowerCase().includes(q));
  return Response.json({ data, meta: { nextPage: null, totalCount: data.length } });
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MemoryRouter initialEntries={[params.get('path') || '/venues']}>
      <AuthProvider><App /></AuthProvider>
    </MemoryRouter>
  </StrictMode>,
);
