export default function Loading({ children = 'Loading…', className = '' }) {
  return <div role="status" aria-atomic="true" className={`flex flex-col items-center gap-3 py-6 text-small text-muted ${className}`}>
    <svg aria-hidden="true" focusable="false" viewBox="-20 -20 136 112" fill="none" className="h-24 w-28 shrink-0">
      <path className="loading-map-left fill-primary" d="M2 13 24 3q2-1 2 2v54q0 2-2 3L3 71q-3 1-3-2V16q0-2 2-3Z" />
      <path className="loading-map-middle fill-primary" d="M30 3q0-3 3-2l27 10q2 1 2 3v55q0 3-3 2l-3-1V42a8 8 0 0 0-16 0v22l-8-3q-2-1-2-3V3Z" />
      <g className="loading-map-right">
        <path className="fill-primary" d="M68 12 92 2q4-2 4 3v54q0 2-2 3L70 72q-4 1-4-3V15q0-2 2-3Z" />
        <path className="fill-accent" fillRule="evenodd" d="M81 21a10 10 0 0 1 10 10c0 7-10 19-10 19S71 38 71 31a10 10 0 0 1 10-10Zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z" clipRule="evenodd" />
      </g>
    </svg>
    <span>{children}</span>
  </div>;
}
