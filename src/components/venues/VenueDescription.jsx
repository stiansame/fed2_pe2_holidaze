import DOMPurify from 'dompurify';

export default function VenueDescription({ description }) {
  return (
    <div
      className="venue-description whitespace-pre-line text-muted wrap-anywhere"
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(description?.trim() || 'No description provided.', {
          USE_PROFILES: { html: true },
          // Keep formatting in our stylesheet; API content must not restyle the page.
          FORBID_TAGS: ['style'],
          FORBID_ATTR: ['style'],
        }),
      }}
    />
  );
}
