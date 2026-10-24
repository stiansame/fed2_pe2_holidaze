import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../Icon.jsx';

const controlClass = 'flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-primary shadow-sm hover:bg-tint sm:size-12';

export default function HomeHero({ venues, onImageError, children }) {
  const [active, setActive] = useState(0);
  const [previous, setPrevious] = useState(null);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(() => document.hidden);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const index = venues.length ? active % venues.length : 0;
  const venue = venues[index];
  const nextPhoto = venues[(index + 1) % venues.length]?.media[0]?.url;
  const rotating = venues.length > 1 && !paused && !hovered && !focused && !hidden && !reducedMotion;

  useEffect(() => {
    if (!nextPhoto) return;
    const image = new Image();
    image.src = nextPhoto;
  }, [nextPhoto]);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = event => {
      setReducedMotion(event.matches);
      if (event.matches) setPrevious(null);
    };
    const updateVisibility = () => setHidden(document.hidden);
    media.addEventListener('change', updateMotion);
    document.addEventListener('visibilitychange', updateVisibility);
    return () => {
      media.removeEventListener('change', updateMotion);
      document.removeEventListener('visibilitychange', updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!rotating) return;
    const timer = setTimeout(() => {
      setPrevious(venue);
      setDirection(1);
      setActive(index + 1);
    }, 10000);
    return () => clearTimeout(timer);
  }, [rotating, index, venue]);

  function move(step) {
    setPrevious(reducedMotion ? null : venue);
    setDirection(step > 0 ? 1 : -1);
    setActive((index + step + venues.length) % venues.length);
  }

  return (
    <section aria-label="Featured stays" aria-roledescription="carousel" className="relative isolate overflow-hidden rounded-lg bg-text text-surface"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onKeyDown={event => {
        if (event.target instanceof HTMLInputElement) return;
        if (venues.length < 2) return;
        if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
        if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
      }}>
      <div aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden" style={{ '--slide-offset': `${direction * 100}%` }}>
        {previous && <img key={`previous-${previous.id}`} src={previous.media[0].url} alt="" onAnimationEnd={() => setPrevious(null)} className="venue-photo absolute inset-0 h-full w-full object-cover motion-safe:animate-[hero-leave_650ms_ease-in-out_both]" />}
        {venue && <img key={venue.id} src={venue.media[0].url} alt="" fetchPriority="high" onError={() => onImageError(venue.id)} className={`venue-photo absolute inset-0 h-full w-full object-cover ${previous ? 'motion-safe:animate-[hero-enter_650ms_ease-in-out_both]' : ''}`} />}
      </div>
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-black/80 via-black/35 to-transparent" />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/65 via-transparent to-transparent" />
      <div className="flex min-h-112 flex-col justify-between gap-6 px-4 pt-6 pb-16 sm:min-h-120 sm:px-20 sm:pt-12">
        <div className="max-w-2xl space-y-3">
          <p className="text-caption font-semibold tracking-widest">FIND YOUR NEXT STAY</p>
          <h1 className="text-[1.875rem] leading-9 font-bold sm:text-display sm:leading-14">Find somewhere worth staying</h1>
          <p className="hidden sm:block">Cabins, apartments and every stay in between.</p>
        </div>
        {venues.length > 1 && <div className="flex justify-between sm:absolute sm:inset-x-4 sm:top-[42%]">
          <button type="button" aria-label="Previous stay" onClick={() => move(-1)} className={controlClass}><Icon name="left" /></button>
          <button type="button" aria-label="Next stay" onClick={() => move(1)} className={controlClass}><Icon name="right" /></button>
        </div>}
        <div className="max-w-4xl space-y-4">
        <div aria-live={rotating ? 'off' : 'polite'} aria-atomic="true" role="group" aria-roledescription="slide" aria-label={venue ? `${index + 1} of ${venues.length}` : undefined} className="max-w-xl space-y-1">
          {venue && <>
            <h2 className="line-clamp-2 text-body font-semibold wrap-anywhere">{venue.name?.trim() || 'Unnamed stay'}</h2>
            <p className="flex items-center gap-2 text-small"><Icon name="pin" />{[venue.location?.city, venue.location?.country].filter(Boolean).join(', ') || 'Location not specified'}</p>
          </>}
          <Link to={venue ? `/venues/${encodeURIComponent(venue.id)}` : '/venues'} className="inline-flex min-h-12 items-center gap-2 text-small font-semibold text-surface underline decoration-surface/60 underline-offset-4 hover:decoration-surface">{venue ? 'Explore this stay' : 'Explore venues'}<Icon name="right" /></Link>
        </div>
        {children}
        </div>
      </div>
      {venues.length > 1 && <>
        <div aria-label="Choose a featured stay" className="absolute inset-x-14 bottom-2 flex justify-center">
          {venues.map((item, i) => <button key={item.id} type="button" aria-label={`Show stay ${i + 1}`} aria-current={i === index ? 'true' : undefined} onClick={() => { if (i !== index) move(i - index); }} className="flex h-12 min-w-6 items-center justify-center rounded-full sm:min-w-8"><span className={`size-2.5 rounded-full ${i === index ? 'bg-accent' : 'bg-surface'}`} /></button>)}
        </div>
        <button type="button" aria-label={paused ? 'Resume slideshow' : 'Pause slideshow'} aria-pressed={paused} onClick={() => setPaused(value => !value)} className={`absolute right-3 bottom-3 ${controlClass}`}><Icon name={paused ? 'play' : 'pause'} /></button>
      </>}
    </section>
  );
}
