import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client.js';
import VenueCard from '../components/venues/VenueCard.jsx';

export default function Venues() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    apiRequest('holidaze/venues', {
      query: { limit: 12, sort: 'created', sortOrder: 'desc' }, signal: controller.signal,
    }).then(data => {
      if (!controller.signal.aborted) setResult(data);
    }).catch(error => {
      if (!controller.signal.aborted) setError(error.message);
    });
    return () => controller.abort();
  }, [attempt]);

  return (
    <section aria-labelledby="venues-heading">
      <h1 id="venues-heading" className="text-h2 font-bold">Explore venues</h1>
      <p className="mt-3 text-muted">Find somewhere worth staying.</p>
      {!result && !error && <p role="status" className="mt-8">Loading stays…</p>}
      {error && <div className="mt-8 space-y-4">
        <p role="alert" className="text-danger">{error}</p>
        <button type="button" onClick={() => { setError(''); setAttempt(value => value + 1); }} className="min-h-12 rounded-lg bg-primary px-4 font-semibold text-surface hover:bg-primary-hover">Try again</button>
      </div>}
      {result && (result.data.length ? <>
        <p role="status" className="mt-6 text-small text-muted">Showing {result.data.length} of {result.meta.totalCount} stays.</p>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.data.map(venue => <VenueCard key={venue.id} venue={venue} />)}
        </div>
      </> : <p role="status" className="mt-8">No stays available right now.</p>)}
    </section>
  );
}
