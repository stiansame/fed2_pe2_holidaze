import { useState } from "react";

/**
 * Displays a venue image or fallback and reports image failures when requested.
 * @param {object} props Component props.
 * @param {object} [props.media] Image URL and optional alt text.
 * @param {string} props.name Fallback image description.
 * @param {string} [props.className] Additional styling classes.
 * @param {string} [props.imageClass] Classes applied to the image itself.
 * @param {string} [props.loading] Native image loading strategy.
 * @param {Function} [props.onImageError] Reports a failed image.
 * @returns {import('react').ReactNode}
 */
export default function VenueImage({
  media,
  name,
  className = "h-50 rounded-t-lg",
  imageClass = "object-cover",
  loading = "lazy",
  onImageError,
}) {
  const [failed, setFailed] = useState(false);
  const url = media?.url;
  return (
    <span
      className={`flex items-center justify-center overflow-hidden bg-tint text-small text-muted ${className}`}
    >
      {url && !failed ? (
        <img
          src={url}
          alt={media.alt?.trim() || name}
          loading={loading}
          onError={() => {
            setFailed(true);
            onImageError?.();
          }}
          className={`h-full w-full ${imageClass}`}
        />
      ) : (
        <span>Image not available</span>
      )}
    </span>
  );
}
