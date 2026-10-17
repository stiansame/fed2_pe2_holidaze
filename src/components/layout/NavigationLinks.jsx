import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.js';

export default function NavigationLinks({ mobile = false, onNavigate }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    { to: '/venues', label: mobile ? 'Explore venues' : 'Explore' },
    ...(user ? [
      { to: '/bookings', label: 'My bookings' },
      { to: '/profile', label: 'My profile' },
      ...(user.venueManager ? [{ to: '/manager', label: 'Manager' }] : []),
    ] : [
      { to: '/login', label: 'Log in' },
      { to: '/register', label: mobile ? 'Create account' : 'Get started', primary: !mobile },
    ]),
  ];

  return <>{links.map(({ to, label, primary }) => (
    <NavLink
      key={to}
      to={to}
      onClick={onNavigate}
      className={({ isActive }) => `inline-flex min-h-12 items-center justify-center rounded-lg border px-4 text-small font-semibold ${mobile ? 'w-full' : 'min-w-30'} ${primary ? 'border-primary bg-primary text-surface hover:bg-primary-hover' : `border-border text-primary hover:bg-tint ${isActive ? 'bg-tint' : 'bg-surface'}`}`}
    >
      {label}
    </NavLink>
  ))}{user && <button type="button" className={`min-h-12 rounded-lg border border-border px-4 text-small font-semibold text-primary hover:bg-tint ${mobile ? 'w-full' : ''}`} onClick={() => {
    logout();
    onNavigate?.();
    navigate('/', { replace: true });
  }}>Log out</button>}</>;
}
