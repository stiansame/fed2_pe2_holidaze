import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.js';
import Icon from '../Icon.jsx';
import HostAvatar from '../HostAvatar.jsx';
import { navigationOrigin } from '../../utils/navigation.js';

export default function AccountLayout() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const { pathname } = location;
  const links = [
    { to: '/profile', label: user.name },
    { to: '/bookings', label: 'My bookings', icon: 'calendar' },
    ...(user.venueManager ? [
      { to: '/manager/venues', label: 'My venues', icon: 'home' },
      { to: '/manager/bookings', label: 'Bookings', icon: 'calendar-users' },
      { to: '/manager/venues/new', label: 'Create venue', icon: 'plus' },
    ] : []),
  ];
  const active = (links.find(link => pathname === link.to) || links.find(link => link.to !== '/profile' && pathname.startsWith(`${link.to}/`)))?.to;

  return <div className="grid items-start gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
    <aside className="mobile-bottom-bar min-w-0 lg:sticky lg:inset-x-auto lg:top-6 lg:bottom-auto lg:rounded-xl lg:border lg:border-border lg:pb-3 lg:shadow-none">
      <nav aria-label="Account navigation" className="flex items-center justify-around gap-1 lg:block lg:space-y-2">
        {links.map(({ to, label, icon }) => <Link key={to} to={to} state={navigationOrigin(location)} aria-current={active === to ? 'page' : undefined} title={label} aria-label={label} className={`flex h-11 min-w-0 flex-1 items-center justify-center gap-3 rounded-lg px-2 text-small font-semibold lg:justify-start lg:px-3 ${active === to ? 'bg-tint text-primary' : 'text-muted hover:bg-tint hover:text-primary'}`}>{icon ? <Icon name={icon} className="size-6 shrink-0 lg:size-5" /> : <HostAvatar key={(profile ? profile.avatar : user.avatar)?.url} media={profile ? profile.avatar : user.avatar} className="size-8" />}<span className="sr-only min-w-0 truncate lg:not-sr-only">{label}</span></Link>)}
      </nav>
    </aside>
    <div className="min-w-0"><Outlet /></div>
  </div>;
}
