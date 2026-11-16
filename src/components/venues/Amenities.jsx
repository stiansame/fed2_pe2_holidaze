import { amenityOptions } from "./amenityOptions.js";

/**
 * Displays enabled venue amenities using the shared labels and icons.
 * @param {object} props Component props.
 * @param {object} props.meta Venue amenity flags.
 * @param {boolean} [props.compact] Uses the compact layout.
 * @returns {import('react').ReactNode}
 */
export default function Amenities({ meta, compact = false }) {
  const available = amenityOptions.filter((item) => meta?.[item.key] === true);
  if (!available.length) return null;
  return (
    <ul
      aria-label="Amenities"
      className={`flex gap-1 ${compact ? "flex-nowrap" : "flex-wrap"}`}
    >
      {available.map(({ key, label, icon }) => (
        <li
          key={key}
          aria-label={label}
          title={label}
          className="pill amenity-pill shrink-0 border-border bg-surface text-text"
        >
          <img src={icon} alt="" width="18" height="18" className="shrink-0" />
          {label}
        </li>
      ))}
    </ul>
  );
}
