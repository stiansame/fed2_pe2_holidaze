import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getHighlyRatedVenues, getVenues } from '../api/venues.js';
import { hasVenuePhoto, shuffleVenuesWithPhotos } from '../utils/venue.js';
import HomeHero from '../components/venues/HomeHero.jsx';
import VenueCard from '../components/venues/VenueCard.jsx';
import Icon from '../components/Icon.jsx';

export default function Home() {
  const [venues, setVenues] = useState([]);
  const [highlyRated, setHighlyRated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    // Sample a random page so the whole catalogue can feature without loading it all.
    const heroRequest = getVenues({ limit: 1, signal: controller.signal }).then(result => getVenues({
      limit: 100,
      page: Math.floor(Math.random() * Math.max(1, Math.ceil(result.meta.totalCount / 100))) + 1,
      signal: controller.signal,
    }));
    Promise.allSettled([heroRequest, getHighlyRatedVenues({ signal: controller.signal })]).then(([hero, rated]) => {
      if (controller.signal.aborted) return;
      if (hero.status === 'fulfilled') setVenues(shuffleVenuesWithPhotos(hero.value.data));
      if (rated.status === 'fulfilled') setHighlyRated(rated.value.data.filter(venue => venue.rating >= 4 && hasVenuePhoto(venue)));
      else setError(rated.reason.message);
      setLoading(false);
    });
    return () => controller.abort();
  }, [attempt]);

  return (
    <div className="space-y-8">
      <HomeHero venues={venues.slice(0, 6)} onImageError={id => setVenues(previous => previous.filter(venue => venue.id !== id))}>
      <form role="search" className="flex gap-3 rounded-lg border border-border bg-surface p-3 text-text shadow-sm" onSubmit={event => {
        event.preventDefault();
        const input = event.currentTarget.elements.q;
        const q = input.value.trim();
        if (q && q.length < 3) { input.setCustomValidity('Enter at least 3 characters.'); input.reportValidity(); return; }
        navigate(`/venues${q ? `?${new URLSearchParams({ q })}` : ''}`);
      }}>
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border px-3 text-muted"><Icon name="search" className="hidden size-5 shrink-0 sm:block" /><span className="sr-only">Search venues</span><input name="q" type="search" minLength="3" onInput={event => event.currentTarget.setCustomValidity('')} placeholder="Search venues" className="min-h-12 min-w-0 w-full bg-surface text-text outline-offset-[-4px]" /></label>
        <button type="submit" className="min-h-12 rounded-lg bg-primary px-3 font-semibold text-surface hover:bg-primary-hover sm:px-6">Search</button>
      </form>
      </HomeHero>
      <section aria-labelledby="discover-heading" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="discover-heading" className="text-h3 font-bold sm:text-h2">Highly rated stays</h2>
          <Link to="/venues" className="inline-flex min-h-12 items-center gap-2 font-semibold text-primary hover:underline">View all venues<Icon name="right" /></Link>
        </div>
        {loading ? <p role="status">Loading stays…</p> : error ? <div role="alert" className="space-y-3"><p>Unable to load stays. {error}</p><button type="button" onClick={() => { setError(''); setLoading(true); setAttempt(value => value + 1); }} className="min-h-12 rounded-lg border border-border bg-surface px-4 font-semibold text-primary hover:bg-tint">Try again</button></div>
          : highlyRated.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{highlyRated.slice(0, 6).map(venue => <VenueCard key={venue.id} venue={venue} onImageError={id => setHighlyRated(previous => previous.filter(item => item.id !== id))} />)}</div>
          : <p>No highly rated stays with photos are available right now. Explore all venues to find your next stay.</p>}
      </section>
    </div>
  );
}
