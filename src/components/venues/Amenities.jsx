import { amenityOptions } from './amenityOptions.js';

export default function Amenities({ meta, compact = false }) {
  const available = amenityOptions.filter(item => meta?.[item.key] === true);
  if (!available.length) return null;
  return (
    <ul aria-label="Amenities" className={`flex gap-1 ${compact ? 'flex-nowrap' : 'flex-wrap'}`}>
      {available.map(({ key, label, icon }) => <li key={key} aria-label={label} title={label} className="inline-flex h-8 shrink-0 items-center gap-0.5 rounded-full border border-border bg-surface px-0.5 text-[11px] leading-4 text-text min-[375px]:px-2">
        <img src={icon} alt="" width="18" height="18" className="shrink-0" />{key === 'pets' ? 'Pets' : label}
      </li>)}
    </ul>
  );
}
