import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.js';
import Icon from '../Icon.jsx';

export default function AccountLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const links = [
    { to: '/profile', label: 'Profile', icon: 'user' },
    { to: '/bookings', label: 'My bookings', icon: 'calendar' },
    ...(user.venueManager ? [
      { to: '/manager', label: 'Dashboard', icon: 'dashboard' },
      { to: '/manager/venues', label: 'My venues', icon: 'home' },
      { to: '/manager/bookings', label: 'Bookings', icon: 'calendar' },
      { to: '/manager/venues/new', label: 'Create venue', icon: 'plus' },
    ] : []),
  ];

  return <div className="grid items-start gap-6 lg:grid-cols-[14rem_minmax(0,1fr)]">
    <aside className="min-w-0 rounded-xl border border-border bg-surface p-3 lg:sticky lg:top-6">
      <label className="block text-small font-semibold text-primary lg:hidden">Account menu
        <select value={links.some(link => link.to === pathname) ? pathname : '/bookings'} onChange={event => navigate(event.target.value)} className="mt-2 min-h-12 w-full rounded-lg border border-border bg-surface px-3 text-text">
          {links.map(({ to, label }) => <option key={to} value={to}>{label}</option>)}
        </select>
      </label>
      <nav aria-label="Account navigation" className="hidden space-y-2 lg:block">
        {links.map(({ to, label, icon }) => <NavLink key={to} to={to} end className={({ isActive }) => `flex min-h-12 items-center gap-3 rounded-lg px-3 text-small font-semibold ${isActive ? 'bg-tint text-primary' : 'text-muted hover:bg-tint hover:text-primary'}`}><Icon name={icon} />{label}</NavLink>)}
      </nav>
    </aside>
    <div className="min-w-0"><Outlet /></div>
  </div>;
}
