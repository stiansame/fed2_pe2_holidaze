import { useRef, useState } from 'react';
import VenueImage from './VenueImage.jsx';

const controlClass = 'min-h-12 rounded-lg border border-border bg-surface px-4 font-semibold text-primary hover:bg-tint disabled:opacity-50';

export default function VenueGallery({ media = [], name }) {
  const photos = (media ?? []).filter(photo => typeof photo?.url === 'string' && photo.url.trim());
  const [active, setActive] = useState(0);
  const dialog = useRef(null);
  const photo = photos[active];

  function move(step) {
    setActive(index => (index + step + photos.length) % photos.length);
  }

  return (
    <section aria-label="Venue photos" className="space-y-4">
      {photos.length ? <>
        <div className={`grid gap-3 ${photos.length > 1 ? 'sm:h-90 sm:grid-cols-[1.8fr_1fr]' : ''}`}>
          <button type="button" aria-label="Open photo gallery" onClick={() => { setActive(0); dialog.current.showModal(); }} className="min-h-0 min-w-0 rounded-lg">
            <VenueImage media={photos[0]} name={name} loading="eager" className={`h-64 rounded-lg ${photos.length > 1 ? 'sm:h-full' : 'sm:h-90'}`} />
          </button>
          {photos.length > 1 && <div className={`grid min-h-0 grid-cols-2 gap-3 ${photos.length > 2 ? 'sm:grid-rows-2' : ''}`}>
            {photos.slice(1, 4).map((item, index) => <button key={`${item.url}-${index}`} type="button" aria-label={`Open photo ${index + 2}`} onClick={() => { setActive(index + 1); dialog.current.showModal(); }} className={`relative min-h-0 min-w-0 overflow-hidden rounded-lg ${index === 0 ? 'col-span-2' : photos.length === 3 ? 'col-span-2' : ''}`}>
              <VenueImage media={item} name={`Photo ${index + 2} of ${name}`} className="h-28 rounded-lg sm:h-full" />
              {index === 2 && photos.length > 4 && <span className="absolute inset-0 flex items-center justify-center bg-primary/90 px-2 font-semibold text-surface">+{photos.length - 4} photos</span>}
            </button>)}
          </div>}
        </div>
        <button type="button" onClick={() => dialog.current.showModal()} className={`${controlClass} w-full sm:w-auto`}>View all photos ({photos.length})</button>
        <dialog ref={dialog} aria-label={`Photos of ${name}`} className="m-auto max-h-[90dvh] w-[min(95vw,64rem)] overflow-y-auto rounded-lg bg-surface p-4 text-text backdrop:bg-black/70" onKeyDown={event => {
          if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
          if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
        }}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p aria-live="polite">Photo {active + 1} of {photos.length}</p>
            <button type="button" autoFocus onClick={() => dialog.current.close()} className={controlClass}>Close gallery</button>
          </div>
          <VenueImage key={photo.url} media={photo} name={name} loading="eager" className="h-[55dvh] rounded-lg" imageClass="object-contain" />
          {photos.length > 1 && <div className="mt-4 flex justify-between gap-3">
            <button type="button" onClick={() => move(-1)} className={controlClass}>Previous photo</button>
            <button type="button" onClick={() => move(1)} className={controlClass}>Next photo</button>
          </div>}
        </dialog>
      </> : <VenueImage name={name} className="h-64 rounded-lg sm:h-90" />}
    </section>
  );
}
