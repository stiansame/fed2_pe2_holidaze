import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { appendVenuePage, filterVenues, getVenues, venueSorts } from '../api/venues.js';
import { amenityOptions } from '../components/venues/amenityOptions.js';
import VenueCard from '../components/venues/VenueCard.jsx';

const buttonClass = 'min-h-12 rounded-lg bg-primary px-5 font-semibold text-surface hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60';
const fieldClass = 'mt-2 min-h-12 w-full rounded-lg border border-border bg-surface px-3 font-normal';

export default function Venues() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q')?.trim() || '';
  const order = Object.hasOwn(venueSorts, params.get('order')) ? params.get('order') : 'newest';
  const guests = Math.min(100, Math.max(0, Number.parseInt(params.get('guests'), 10) || 0));
  const amenities = amenityOptions.filter(item => params.get(item.key) === 'true').map(item => item.key);
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

  return (
    <section aria-labelledby="venues-heading">
      <h1 id="venues-heading" className="text-h2 font-bold">Explore venues</h1>
      <p className="mt-3 text-muted">Find somewhere worth staying.</p>
      <form role="search" className="mt-6" onSubmit={event => event.preventDefault()}>
        <label className="block text-small font-semibold">Search venues
          <input name="q" type="search" value={search.value} onChange={event => setSearch({ value: event.target.value, url: q })} aria-describedby="search-hint" placeholder="Search by name or description" className={fieldClass} />
        </label>
        <p id="search-hint" role="status" className="mt-2 text-small text-muted">{tooShort ? 'Enter at least 3 characters.' : 'Results update automatically after you stop typing.'}</p>
      </form>
      <div className="mt-6 flex flex-wrap items-end gap-4">
        <label className="block text-small font-semibold">Guests
          <input type="number" min="1" max="100" step="1" value={guests || ''} onChange={event => update('guests', event.target.value)} placeholder="Any" className={`${fieldClass} max-w-28`} />
        </label>
        <label className="block text-small font-semibold">Sort by
          <select value={order} onChange={event => update('order', event.target.value === 'newest' ? '' : event.target.value)} className={fieldClass}>
            {Object.entries(venueSorts).map(([key, option]) => <option key={key} value={key}>{option.label}</option>)}
          </select>
        </label>
      </div>
      <fieldset className="mt-5">
        <legend className="mb-2 text-small font-semibold">Amenities</legend>
        <div className="flex flex-wrap gap-3">
          {amenityOptions.map(item => <label key={item.key} className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-4 text-small">
            <input type="checkbox" checked={amenities.includes(item.key)} onChange={event => update(item.key, event.target.checked ? 'true' : '')} className="size-4 accent-primary" />
            <img src={item.icon} alt="" width="18" height="18" />{item.label}
          </label>)}
        </div>
      </fieldset>
      {(guests > 0 || amenities.length > 0 || order !== 'newest') && <button type="button" className="mt-4 min-h-12 rounded-lg border border-border px-4 text-small font-semibold text-primary hover:bg-tint" onClick={() => {
        setParams(previous => {
          const next = new URLSearchParams(previous);
          ['guests', 'order', ...amenityOptions.map(item => item.key)].forEach(key => next.delete(key));
          return next;
        });
      }}>Reset filters</button>}
      <p className="mt-4 text-small text-muted">Guest and amenity filters apply only to loaded stays. Load more to check additional stays. Sorting applies to all results.</p>
      {!tooShort && <VenueResults key={`${q}|${order}`} q={q} order={order} filters={{ guests, amenities }} waiting={waiting} />}
    </section>
  );
}

function VenueResults({ q, order, filters, waiting }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getVenues({ q, order, page, signal: controller.signal }).then(data => {
      if (!controller.signal.aborted) {
        setResult(previous => appendVenuePage(previous, data));
        setLoading(false);
      }
    }).catch(error => {
      if (!controller.signal.aborted) {
        setError(error.message);
        setLoading(false);
      }
    });
    return () => controller.abort();
  }, [q, order, page, attempt]);

  const visible = filterVenues(result?.data ?? [], filters);
  const filtered = filters.guests > 0 || filters.amenities.length > 0;
  return (
    <>
      <p role="status" className="mt-6 text-small text-muted">
        {waiting ? 'Waiting for your search…' : loading ? 'Loading stays…' : result && (
          result.data.length ? filtered
            ? `${visible.length} matching stays among ${result.data.length} loaded (${result.meta.totalCount} results before guest and amenity filters).`
            : `Showing ${result.data.length} of ${result.meta.totalCount} stays${q ? ` matching “${q}”` : ''}.`
          : q ? `No stays found for “${q}”. Try another search.` : 'No stays available right now.')}
      </p>
      {!waiting && !loading && filtered && result?.data.length > 0 && !visible.length && <p className="mt-3">No loaded stays match your filters. {result.meta.nextPage ? 'Load more or adjust your filters.' : 'Try adjusting your filters.'}</p>}
      {visible.length > 0 && <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map(venue => <VenueCard key={venue.id} venue={venue} />)}
      </div>}
      {error && <div className="mt-6 space-y-4">
        <p role="alert" className="text-danger">{error}</p>
        <button type="button" disabled={loading || waiting} onClick={() => {
          setError(''); setLoading(true); setAttempt(value => value + 1);
        }} className={buttonClass}>Try again</button>
      </div>}
      {result?.meta.nextPage && !error && <button type="button" disabled={loading || waiting} onClick={() => {
        setLoading(true); setPage(result.meta.nextPage);
      }} className={`${buttonClass} mt-6`}>{loading ? 'Loading…' : 'Load more'}</button>}
    </>
  );
}
