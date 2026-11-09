import DOMPurify from 'dompurify';
import { useState } from 'react';

export default function VenueDescription({ description }) {
  const [expanded, setExpanded] = useState(false);
  const html = DOMPurify.sanitize(description?.trim() || 'No description provided.', {
    USE_PROFILES: { html: true },
    // Keep formatting in our stylesheet; API content must not restyle the page.
    FORBID_TAGS: ['style'],
    FORBID_ATTR: ['style'],
  });
  return (
    <>
    <div className="lg:hidden">
      <div className={`${expanded ? 'venue-description' : 'line-clamp-3'} whitespace-pre-line text-muted wrap-anywhere`} dangerouslySetInnerHTML={{ __html: expanded ? html : DOMPurify.sanitize(html.replace(/<\/[^>]+>|<br\s*\/?>/gi, ' '), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }) }} />
      <button type="button" aria-expanded={expanded} onClick={() => setExpanded(value => !value)} className="mt-2 min-h-11 rounded font-semibold text-primary">{expanded ? 'Read less' : 'Read more'}</button>
    </div>
    <div
      className="venue-description hidden whitespace-pre-line text-muted wrap-anywhere lg:block"
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    />
    </>
  );
}
