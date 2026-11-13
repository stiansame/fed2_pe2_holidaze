const paths = {
  'calendar-check': <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 11h18m-13 5 3 3 5-5" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m16 8-2 6-6 2 2-6Z" /></>,
  login: <><path d="M14 3h6v18h-6M3 12h12m-4-4 4 4-4 4" /></>,
  logout: <><path d="M10 3H4v18h6m0-9h11m-4-4 4 4-4 4" /></>,
  'user-plus': <><circle cx="9" cy="7" r="4" /><path d="M2 21v-2a7 7 0 0 1 14 0v2m3-12v8m-4-4h8" /></>,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  filter: <><path d="M3 7h18M3 17h18" /><circle cx="8" cy="7" r="3" fill="var(--color-surface)" /><circle cx="16" cy="17" r="3" fill="var(--color-surface)" /></>,
  moon: <path d="M21 13a9 9 0 0 1-10-10 9 9 0 1 0 10 10Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>,
  edit: <><path d="m16 3 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14Z" /></>,
  trash: <><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" /></>,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" />,
  sort: <path d="M8 3v18m-4-4 4 4 4-4M16 21V3m-4 4 4-4 4 4" />,
  reset: <><path d="M3 10a9 9 0 1 1 2 8M3 4v6h6" /></>,
  pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 22v-2a8 8 0 0 1 16 0v2" /></>,
  left: <path d="m15 18-6-6 6-6" />,
  right: <path d="m9 18 6-6-6-6" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  search: <><circle cx="10" cy="10" r="7" /><path d="m15 15 6 6" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4m10-4v4M3 11h18" /></>,
  'calendar-users': <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M7 2v4m10-4v4M3 9h18M6 19v-1a3 3 0 0 1 6 0v1m0-1a3 3 0 0 1 6 0v1" /><circle cx="9" cy="13" r="1.5" /><circle cx="15" cy="13" r="1.5" /></>,
  bed: <><path d="M3 18v3m18-3v3M3 18h18V9a3 3 0 0 0-3-3h-6v8H3V6m9 8h9" /><circle cx="7" cy="10" r="2" /></>,
  home: <><path d="m3 10 9-7 9 7v11H3Z" /><path d="M9 21v-8h6v8" /></>,
  plus: <path d="M12 4v16M4 12h16" />,
};

export default function Icon({ name, className = 'size-5 shrink-0' }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>{paths[name]}</svg>;
}
