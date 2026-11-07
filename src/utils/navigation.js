export function navigationOrigin({ pathname, search = '', state }) {
  return { backTo: pathname + search, backState: state };
}

export function backDestination(state, to = '/venues', label = 'Back to venues') {
  const target = state?.backTo;
  if (typeof target !== 'string' || !target.startsWith('/') || target.startsWith('//') || target.includes('\\')) return { to, label };
  const path = target.split('?')[0];
  const names = {
    '/': 'home', '/venues': 'venues', '/profile': 'profile', '/bookings': 'my bookings',
    '/manager': 'dashboard', '/manager/venues': 'my venues', '/manager/bookings': 'venue bookings',
    '/manager/venues/new': 'create venue',
  };
  const name = names[path] || (/^\/manager\/bookings\/[^/]+$/.test(path) ? 'booking details'
    : /^\/venues\/[^/]+$/.test(path) ? 'venue' : /^\/profiles\/[^/]+$/.test(path) ? 'profile' : null);
  return name ? { to: target, label: `Back to ${name}` } : { to, label };
}
