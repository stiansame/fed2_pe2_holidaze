import { useState } from 'react';

export default function VenueImage({ media, name }) {
  const [failed, setFailed] = useState(false);
  const url = media?.url;
  return (
    <div className="flex h-50 items-center justify-center overflow-hidden rounded-t-lg bg-tint text-small text-muted">
      {url && !failed ? <img src={url} alt={media.alt?.trim() || name} loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-cover" />
        : <span>Image not available</span>}
    </div>
  );
}
