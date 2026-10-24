import { useState } from 'react';

export default function VenueImage({ media, name, className = 'h-50 rounded-t-lg', imageClass = 'object-cover', loading = 'lazy' }) {
  const [failed, setFailed] = useState(false);
  const url = media?.url;
  return (
    <div className={`flex items-center justify-center overflow-hidden bg-tint text-small text-muted ${className}`}>
      {url && !failed ? <img src={url} alt={media.alt?.trim() || name} loading={loading} onError={() => setFailed(true)} className={`h-full w-full ${imageClass}`} />
        : <span>Image not available</span>}
    </div>
  );
}
