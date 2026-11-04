export default function AmenityPill({ item, selected, onClick }) {
  return <button type="button" aria-pressed={selected} onClick={onClick}
    className={`inline-flex min-h-12 items-center gap-2 rounded-full border px-3 text-small sm:px-4 ${selected ? 'border-primary bg-primary text-surface' : 'border-border bg-surface hover:bg-tint'}`}>
    <img src={item.icon} alt="" width="18" height="18" className={selected ? 'brightness-0 invert' : ''} />{item.label}
  </button>;
}
