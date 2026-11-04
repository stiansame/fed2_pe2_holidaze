export default function AmenityPill({ item, selected, onClick }) {
  return <button type="button" aria-pressed={selected} onClick={onClick}
    className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border px-2.5 text-small sm:min-h-10 sm:px-2 ${selected ? 'border-primary bg-primary text-surface' : 'border-border bg-surface hover:bg-tint'}`}>
    <img src={item.icon} alt="" width="16" height="16" className={selected ? 'brightness-0 invert' : ''} />{item.label}
  </button>;
}
