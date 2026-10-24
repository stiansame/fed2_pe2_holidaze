import { amenityOptions } from './amenityOptions.js';

export default function Amenities({ meta }) {
  const available = amenityOptions.filter(item => meta?.[item.key] === true);
  if (!available.length) return null;
  return (
    <ul aria-label="Amenities" className="flex flex-wrap gap-x-2.5 gap-y-1.5">
      {available.map(({ key, label, icon }) => <li key={key} className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1.5 text-[11px] leading-4.5 text-text">
        <img src={icon} alt="" width="18" height="18" />{label}
      </li>)}
    </ul>
  );
}
