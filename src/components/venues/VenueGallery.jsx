import { useRef, useState } from 'react';
import VenueImage from './VenueImage.jsx';
import Icon from '../Icon.jsx';

const controlClass = 'min-h-12 rounded-lg border border-border bg-surface px-4 font-semibold text-primary hover:bg-tint disabled:opacity-50';
const galleryControl = 'absolute z-10 flex size-12 items-center justify-center rounded-full border border-border bg-surface text-primary shadow-sm hover:bg-tint';

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
        <dialog ref={dialog} aria-label={`Photos of ${name}`} className="m-auto max-h-[94dvh] max-w-[96vw] overflow-hidden rounded-lg bg-surface p-0 text-text backdrop:bg-black/70" onKeyDown={event => {
          if (event.key === 'ArrowLeft') { event.preventDefault(); move(-1); }
          if (event.key === 'ArrowRight') { event.preventDefault(); move(1); }
        }}>
          <button type="button" aria-label="Close gallery" autoFocus onClick={() => dialog.current.close()} className={`${galleryControl} right-2 top-2`}><Icon name="close" /></button>
          <VenueImage key={photo.url} media={photo} name={name} loading="eager" className="min-h-48 min-w-64 rounded-lg has-[>span]:min-h-64" imageClass="!h-auto !w-auto max-h-[94dvh] max-w-[96vw] object-contain" />
          <p aria-live="polite" className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-surface px-3 py-1 text-small text-text">{active + 1} / {photos.length}</p>
          {photos.length > 1 && <>
            <button type="button" aria-label="Previous photo" onClick={() => move(-1)} className={`${galleryControl} left-2 top-1/2 -translate-y-1/2`}><Icon name="left" /></button>
            <button type="button" aria-label="Next photo" onClick={() => move(1)} className={`${galleryControl} right-2 top-1/2 -translate-y-1/2`}><Icon name="right" /></button>
          </>}
        </dialog>
      </> : <VenueImage name={name} className="h-64 rounded-lg sm:h-90" />}
    </section>
  );
}
