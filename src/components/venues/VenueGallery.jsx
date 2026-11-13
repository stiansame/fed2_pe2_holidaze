import { useLayoutEffect, useRef, useState } from 'react';
import VenueImage from './VenueImage.jsx';
import Icon from '../Icon.jsx';

const counterClass = 'pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-surface px-3 py-1 text-small text-text';
const controlClass = 'h-11 rounded-lg border border-border bg-surface px-4 font-semibold text-primary hover:bg-tint disabled:opacity-50';
const galleryControl = 'absolute z-10 flex size-11 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-sm hover:bg-tint';

export default function VenueGallery({ media = [], name, children, backLink }) {
  const photos = (media ?? []).filter(photo => typeof photo?.url === 'string' && photo.url.trim());
  const [active, setActive] = useState(0);
  const dialog = useRef(null);
  const strip = useRef(null);
  const modalStrip = useRef(null);
  const photo = photos[active];

  useLayoutEffect(() => {
    if (dialog.current?.open) modalStrip.current.scrollTo({ left: active * modalStrip.current.clientWidth, behavior: 'instant' });
  }, [active]);

  function openPhoto(index = active) {
    setActive(index);
    dialog.current.showModal();
    modalStrip.current.scrollTo({ left: index * modalStrip.current.clientWidth, behavior: 'instant' });
  }

  function move(step) {
    const index = (active + step + photos.length) % photos.length;
    modalStrip.current.scrollTo({ left: index * modalStrip.current.clientWidth });
  }

  return (
    <section aria-label="Venue photos" className="space-y-4">
      <div className="relative">
      {photos.length ? <>
        <div className="relative lg:hidden">
          <div ref={strip} onScroll={event => setActive(Math.max(0, Math.min(photos.length - 1, Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth))))} className="photo-strip rounded-lg" aria-label="Swipe venue photos">
            {photos.map((item, index) => <button key={`${item.url}-${index}`} type="button" aria-label={`Open photo ${index + 1} of ${photos.length}`} onClick={() => openPhoto(index)} className="w-full shrink-0 snap-center rounded-lg focus-visible:-outline-offset-4">
              <VenueImage media={item} name={item.alt || `${name}, photo ${index + 1}`} loading={index ? 'lazy' : 'eager'} className="relative aspect-square w-full rounded-lg" imageClass="absolute inset-0 object-cover" />
            </button>)}
          </div>
          <p aria-live="polite" className={counterClass}>{active + 1} / {photos.length}</p>
        </div>
        <div className={`hidden gap-3 lg:grid ${photos.length > 1 ? 'sm:h-90 sm:grid-cols-[1.8fr_1fr]' : ''}`}>
          <button type="button" aria-label="Open photo gallery" onClick={() => openPhoto(0)} className="min-h-0 min-w-0 rounded-lg">
            <VenueImage media={photos[0]} name={name} loading="eager" className={`h-64 rounded-lg ${photos.length > 1 ? 'sm:h-full' : 'sm:h-90'}`} />
          </button>
          {photos.length > 1 && <div className={`grid min-h-0 grid-cols-2 gap-3 ${photos.length > 2 ? 'sm:grid-rows-2' : ''}`}>
            {photos.slice(1, 4).map((item, index) => <button key={`${item.url}-${index}`} type="button" aria-label={`Open photo ${index + 2}`} onClick={() => openPhoto(index + 1)} className={`relative min-h-0 min-w-0 overflow-hidden rounded-lg ${index === 0 ? 'col-span-2' : photos.length === 3 ? 'col-span-2' : ''}`}>
              <VenueImage media={item} name={`Photo ${index + 2} of ${name}`} className="h-28 rounded-lg sm:h-full" />
              {index === 2 && photos.length > 4 && <span className="absolute inset-0 flex items-center justify-center bg-primary/90 px-2 font-semibold text-surface">+{photos.length - 4} photos</span>}
            </button>)}
          </div>}
        </div>
        <dialog ref={dialog} onClose={() => strip.current?.scrollTo({ left: active * strip.current.clientWidth, behavior: 'instant' })} aria-label={`Photos of ${name}`} className="m-auto max-h-[94dvh] max-w-[96vw] overflow-hidden rounded-lg bg-surface p-0 text-text backdrop:bg-black/70" onClick={event => {
          if (event.target === event.currentTarget) dialog.current.close();
        }} onKeyDown={event => {
          if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
          if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
        }}>
          <button type="button" aria-label="Close gallery" autoFocus onClick={() => dialog.current.close()} className={`${galleryControl} right-2 top-2`}><Icon name="close" /></button>
          <div className="relative">
            <div aria-hidden="true" className="invisible"><VenueImage key={photo.url} media={photo} name={name} loading="eager" className="min-h-48 min-w-64 rounded-lg has-[>span]:min-h-64" imageClass="!h-auto !w-auto max-h-[94dvh] max-w-[96vw] object-contain" /></div>
            <div ref={modalStrip} aria-label="Swipe gallery photos" className="photo-strip absolute inset-0" onScrollEnd={event => setActive(Math.max(0, Math.min(photos.length - 1, Math.round(event.currentTarget.scrollLeft / event.currentTarget.clientWidth))))}>
              {photos.map((item, index) => <div key={`${item.url}-${index}`} className="h-full w-full shrink-0 snap-center"><VenueImage media={item} name={`${name}, photo ${index + 1}`} className="h-full w-full" imageClass="object-contain" /></div>)}
            </div>
          </div>
          <p aria-live="polite" className={counterClass}>{active + 1} / {photos.length}</p>
          {photos.length > 1 && <>
            <button type="button" aria-label="Previous photo" onClick={() => move(-1)} className={`${galleryControl} left-2 top-1/2 -translate-y-1/2`}><Icon name="left" /></button>
            <button type="button" aria-label="Next photo" onClick={() => move(1)} className={`${galleryControl} right-2 top-1/2 -translate-y-1/2`}><Icon name="right" /></button>
          </>}
        </dialog>
      </> : <VenueImage name={name} className="aspect-square w-full rounded-lg lg:aspect-auto lg:h-90" />}
        {photos.length > 0 && <button type="button" onClick={() => openPhoto()} className={`${controlClass} absolute bottom-3 left-3 z-10 hidden lg:block`}>View all photos ({photos.length})</button>}
        {backLink && <div className="absolute top-3 left-3 z-20 lg:hidden">{backLink}</div>}
        {children && <div className="absolute bottom-3 right-3 z-20">{children}</div>}
      </div>
    </section>
  );
}
