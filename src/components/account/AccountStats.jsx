import Icon from '../Icon.jsx';

/** Shared manager and personal statistics, using the active theme’s colours. */
export default function AccountStats({ items }) {
  return <dl aria-label="Account statistics" className={`grid grid-cols-1 gap-2 lg:h-full lg:auto-rows-fr lg:gap-3 ${items.length > 5 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
    {items.map(([label, value, icon, accent], index) => <div key={label} className={`relative grid min-h-12 min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-3 py-2 lg:flex lg:min-h-32 lg:flex-col lg:items-start lg:justify-end lg:gap-2 lg:p-4 ${items.length === 5 && index === 4 ? 'lg:col-span-2' : ''} ${accent ? 'bg-accent text-text' : 'bg-primary text-surface'}`}>
      <Icon name={icon} className="size-6 shrink-0 lg:absolute lg:top-3 lg:right-3 lg:size-7" />
      <dt className="min-w-0 text-small font-medium lg:order-2">{label}</dt>
      <dd className={`font-bold tracking-tight lg:order-1 lg:pt-6 ${value === 'Not rated yet' ? 'text-small lg:text-lg' : 'text-h3 leading-none lg:text-4xl xl:text-5xl'}`} aria-label={value == null ? 'Unavailable' : undefined}>{value ?? '—'}</dd>
    </div>)}
  </dl>;
}
