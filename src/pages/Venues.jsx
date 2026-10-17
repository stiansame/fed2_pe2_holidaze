import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { appendVenuePage, getVenues } from '../api/venues.js';
import VenueCard from '../components/venues/VenueCard.jsx';

const buttonClass = 'min-h-12 rounded-lg bg-primary px-5 font-semibold text-surface hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60';

export default function Venues() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q')?.trim() || '';
  return (
    <section aria-labelledby="venues-heading">
      <h1 id="venues-heading" className="text-h2 font-bold">Explore venues</h1>
      <p className="mt-3 text-muted">Find somewhere worth staying.</p>
      <form role="search" className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={event => {
        event.preventDefault();
        const value = new FormData(event.currentTarget).get('q').trim();
        setParams(value ? { q: value } : {});
      }}>
        <label className="block flex-1 text-small font-semibold">Search venues
          <input key={q} name="q" type="search" defaultValue={q} placeholder="Search by name or description" className="mt-2 min-h-12 w-full rounded-lg border border-border bg-surface px-3 font-normal" />
        </label>
        <button type="submit" className={buttonClass}>Search</button>
        {q && <button type="button" onClick={() => setParams({})} className="min-h-12 rounded-lg border border-border px-5 font-semibold text-primary hover:bg-tint">Clear search</button>}
      </form>
      <VenueResults key={q} q={q} />
    </section>
  );
}

function VenueResults({ q }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getVenues({ q, page, signal: controller.signal }).then(data => {
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
  }, [q, page, attempt]);

  return (
    <>
      <p role="status" className="mt-6 text-small text-muted">
        {loading ? 'Loading stays…' : result && (result.data.length
          ? `Showing ${result.data.length} of ${result.meta.totalCount} stays${q ? ` matching “${q}”` : ''}.`
          : q ? `No stays found for “${q}”. Try another search.` : 'No stays available right now.')}
      </p>
      {result?.data.length > 0 && <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {result.data.map(venue => <VenueCard key={venue.id} venue={venue} />)}
      </div>}
      {error && <div className="mt-6 space-y-4">
        <p role="alert" className="text-danger">{error}</p>
        <button type="button" disabled={loading} onClick={() => {
          setError(''); setLoading(true); setAttempt(value => value + 1);
        }} className={buttonClass}>Try again</button>
      </div>}
      {result?.meta.nextPage && !error && <button type="button" disabled={loading} onClick={() => {
        setLoading(true); setPage(result.meta.nextPage);
      }} className={`${buttonClass} mt-6`}>{loading ? 'Loading…' : 'Load more'}</button>}
    </>
  );
}
