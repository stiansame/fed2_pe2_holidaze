import { Link } from 'react-router-dom';
import Icon from '../Icon.jsx';

export default function SectionHeading({ title, count, id, to, state, expanded, onToggle, level = 'h2', children }) {
  const Heading = level;
  const actionClass = 'ml-auto inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-text hover:bg-tint';
  const chevron = <Icon name="right" className={`size-8 stroke-[2.5] transition-transform motion-reduce:transition-none ${expanded ? 'rotate-90' : ''}`} />;
  return <div className={`account-section-heading flex min-w-0 items-center gap-3 text-h3 font-bold ${level === 'h1' ? 'sm:text-h2' : ''}`}>
    <Heading id={id} title={title} className="min-w-0 text-[1em] font-bold">
      <span className="relative block max-w-full pr-4">
        <span className="block truncate">{title}</span>
        {count != null && <span className="absolute -top-1 right-0 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] leading-none font-semibold text-surface"><span className="sr-only">Total: </span>{count}</span>}
      </span>
    </Heading>
    {children}
    {to ? <Link to={to} state={state} aria-label={`View all ${title.toLowerCase()}`} className="navigation-link ml-auto shrink-0 text-small">Show all</Link>
      : onToggle && <button type="button" aria-label={`${expanded ? 'Show fewer' : 'Show all'} ${title.toLowerCase()}`} aria-expanded={expanded} onClick={onToggle} className={actionClass}>{chevron}</button>}
  </div>;
}
