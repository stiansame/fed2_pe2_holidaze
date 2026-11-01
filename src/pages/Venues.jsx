import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { filterVenues, getAllVenues, sortVenues, venueSorts } from '../api/venues.js';
import { amenityOptions } from '../components/venues/amenityOptions.js';
import VenueCard from '../components/venues/VenueCard.jsx';
import GuestSelect from '../components/GuestSelect.jsx';
import Icon from '../components/Icon.jsx';
import { addDays, dateKey, validDate } from '../utils/availability.js';

const buttonClass = 'min-h-12 rounded-lg bg-primary px-5 font-semibold text-surface hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60';
const pillClass = 'inline-flex min-h-12 items-center gap-2 rounded-full border border-border bg-surface px-3 text-small sm:px-4 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2';
const selectClass = 'min-h-12 min-w-0 w-full rounded-full bg-transparent pr-2 font-normal outline-none!';

export default function Venues() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q')?.trim() || '';
  const order = Object.hasOwn(venueSorts, params.get('order')) ? params.get('order') : 'newest';
  const guests = Math.min(100, Math.max(0, Number.parseInt(params.get('guests'), 10) || 0));
  const amenities = amenityOptions.filter(item => params.get(item.key) === 'true').map(item => item.key);
  const from = params.get('from') || '';
  const to = params.get('to') || '';
  const datesSelected = Boolean(from || to);
  const dateError = datesSelected && (!validDate(from) || !validDate(to))
    ? 'Choose both check-in and check-out dates.'
    : datesSelected && (from < dateKey() || to <= from)
      ? 'Choose a future stay with check-out after check-in.' : '';
  const activeFilters = Number(guests > 0) + amenities.length + Number(order !== 'newest') + Number(datesSelected);
  const [search, setSearch] = useState({ value: q, url: q });
  // Synchronise the input on back/forward navigation without replacing the focused input.
  if (search.url !== q) setSearch({ value: q, url: q });
  const value = search.value.trim();
  const tooShort = value.length > 0 && value.length < 3;
  const waiting = value !== q;

  useEffect(() => {
    if (value === q || (value.length > 0 && value.length < 3)) return;
    const timer = setTimeout(() => {
      setParams(previous => {
        const next = new URLSearchParams(previous);
        if (value) next.set('q', value);
        else next.delete('q');
        return next;
      }, { replace: true });
    }, value ? 350 : 0);
    return () => clearTimeout(timer);
  }, [value, q, setParams]);

  function update(name, value) {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      if (value) next.set(name, value);
      else next.delete(name);
      return next;
    });
  }

  function resetFilters() {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      ['guests', 'order', 'from', 'to', ...amenityOptions.map(item => item.key)].forEach(key => next.delete(key));
      return next;
    });
  }

  return (
    <section aria-labelledby="venues-heading">
      <h1 id="venues-heading" className="text-h3 font-bold sm:text-h2">Explore venues</h1>
      <p className="mt-2 text-small text-muted sm:text-body">Find somewhere worth staying.</p>
      <form role="search" className="mt-4 sm:mt-6" onSubmit={event => event.preventDefault()}>
        <div className="flex flex-wrap items-center gap-2">
          <label className={`${pillClass} min-w-0 max-w-full`}>
            <span className="sr-only">Sort by</span><Icon name="sort" />
            <select value={order} onChange={event => update('order', event.target.value === 'newest' ? '' : event.target.value)} className={selectClass}>
              {Object.entries(venueSorts).map(([key, option]) => <option key={key} value={key}>{option.label}</option>)}
            </select>
          </label>
          <div role="group" aria-label="Amenities" className="flex flex-wrap gap-2">
            {amenityOptions.map(item => <button key={item.key} type="button" aria-pressed={amenities.includes(item.key)} onClick={() => update(item.key, amenities.includes(item.key) ? '' : 'true')}
              className={`${pillClass} ${amenities.includes(item.key) ? 'border-primary bg-primary! text-surface' : 'hover:bg-tint'}`}>
              <img src={item.icon} alt="" width="18" height="18" className={amenities.includes(item.key) ? 'brightness-0 invert' : ''} />{item.label}
            </button>)}
          </div>
          <button type="button" disabled={!activeFilters} className={`${pillClass} text-primary hover:bg-tint disabled:opacity-50 sm:ml-auto`} onClick={resetFilters}><Icon name="reset" />Reset filters</button>
        </div>
        <div className="mt-4 grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1.6fr)_minmax(0,0.8fr)]">
          <label className={`${pillClass} min-w-0`}>
            <span className="sr-only">Search venues</span><Icon name="search" />
            <input name="q" type="search" value={search.value} onChange={event => setSearch({ value: event.target.value, url: q })} aria-describedby="search-hint" placeholder="Search venues, locations or hosts" className="min-h-12 w-full min-w-0 bg-transparent outline-none!" />
          </label>
          <details className="relative min-w-0" onKeyDown={event => { if (event.key === 'Escape') { event.currentTarget.open = false; event.currentTarget.querySelector('summary').focus(); } }}>
            <summary className={`${pillClass} h-full w-full cursor-pointer list-none [&::-webkit-details-marker]:hidden`}>
              <Icon name="calendar" /><span className="min-w-0 truncate">{from || 'Check-in'} — {to || 'Check-out'}</span>
            </summary>
            <div className="absolute inset-x-0 top-full z-10 mt-2 grid gap-3 rounded-xl border border-border bg-surface p-4 shadow-lg sm:grid-cols-2">
              <label className="min-w-0 text-small font-semibold">Check-in
                <input type="date" value={validDate(from) ? from : ''} min={dateKey()} onChange={event => update('from', event.target.value)} aria-invalid={Boolean(dateError)} aria-describedby="date-hint" className="mt-1 min-h-12 w-full min-w-0 rounded-lg border border-border bg-surface px-2 font-normal" />
              </label>
              <label className="min-w-0 text-small font-semibold">Check-out
                <input type="date" value={validDate(to) ? to : ''} min={validDate(from) && from >= dateKey() ? addDays(from, 1) : addDays(dateKey(), 1)} onChange={event => update('to', event.target.value)} aria-invalid={Boolean(dateError)} aria-describedby="date-hint" className="mt-1 min-h-12 w-full min-w-0 rounded-lg border border-border bg-surface px-2 font-normal" />
              </label>
            </div>
          </details>
          <label className={`${pillClass} min-w-0`}>
            <span className="sr-only">Guests</span><Icon name="user" />
            <GuestSelect value={guests} onChange={value => update('guests', value || '')} allowAny className={selectClass} />
          </label>
        </div>
        <p id="search-hint" role="status" className="mt-2 text-caption text-muted">{tooShort ? 'Enter at least 3 characters.' : 'Search updates automatically · min. 3 characters.'}</p>
        <p id="date-hint" role="status" className="mt-1 text-small text-danger">{dateError}</p>
      </form>
      {!dateError && <VenueResults key={String(datesSelected)} order={order} filters={{ q, guests, amenities, from, to }} waiting={waiting} tooShort={tooShort} />}

    </section>
  );

}

function VenueResults({ order, filters, waiting, tooShort }) {
  const [venues, setVenues] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  const bookings = Boolean(filters.from && filters.to);
  useEffect(() => {
    const controller = new AbortController();
    getAllVenues({ owner: true, bookings, signal: controller.signal }).then(data => {
      if (!controller.signal.aborted) setVenues(data);
    }).catch(error => {
      if (!controller.signal.aborted) setError(error.message);
    });
    return () => controller.abort();
  }, [bookings, attempt]);

  if (tooShort) return null;
  if (waiting) return <p role="status" className="mt-6">Waiting for your search…</p>;
  if (error) return <div className="mt-6 space-y-4">
    <p role="alert" className="text-danger">{error}</p>
    <button type="button" onClick={() => { setError(''); setAttempt(value => value + 1); }} className={buttonClass}>Try again</button>
  </div>;
  if (!venues) return <p role="status" className="mt-6">Loading stays…</p>;
  const matches = sortVenues(filterVenues(venues, filters), order);
  return <VenueMatches key={JSON.stringify([order, filters])} venues={matches} />;
}

function VenueMatches({ venues }) {
  const [count, setCount] = useState(15);
  const visible = venues.slice(0, count);
  return (
    <>
      <p role="status" className="mt-6 text-small text-muted">
        {venues.length ? `Showing ${visible.length} of ${venues.length} matching stays.` : 'No stays match your search and filters. Try adjusting them.'}
      </p>
      {visible.length > 0 && <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(venue => <VenueCard key={venue.id} venue={venue} />)}
      </div>}
      {visible.length < venues.length && <button type="button" onClick={() => setCount(value => value + 15)} className={`${buttonClass} mt-6`}>Load more</button>}
    </>
  );
}
