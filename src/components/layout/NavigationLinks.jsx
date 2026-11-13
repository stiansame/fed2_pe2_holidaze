import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.js';
import HostAvatar from '../HostAvatar.jsx';

export default function NavigationLinks({ mobile = false, onNavigate }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const links = [
    { to: '/venues', label: mobile ? 'Explore venues' : 'Explore' },
    ...(user ? [
      { to: '/profile', label: user.name, account: true },
    ] : [
      { to: '/login', label: 'Log in' },
      { to: '/register', label: mobile ? 'Create account' : 'Get started', primary: !mobile },
    ]),
  ];

  return <>{links.map(({ to, label, primary, account }) => (
    <NavLink
      key={to}
      to={to}
      onClick={onNavigate}
      className={({ isActive }) => `inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-4 text-small font-semibold ${mobile ? 'w-full' : 'min-w-30'} ${primary ? 'border-primary bg-primary text-surface hover:bg-primary-hover' : `border-border text-primary hover:bg-tint ${isActive ? 'bg-tint' : 'bg-surface'}`}`}
    >
      {account && <HostAvatar key={(profile ? profile.avatar : user.avatar)?.url} media={profile ? profile.avatar : user.avatar} className="size-8" />}
      <span className="max-w-40 truncate">{label}</span>
    </NavLink>
  ))}{user && <button type="button" className={`h-11 rounded-lg border border-border px-4 text-small font-semibold text-primary hover:bg-tint ${mobile ? 'w-full' : ''}`} onClick={() => {
    logout();
    onNavigate?.();
    navigate('/', { replace: true });
  }}>Log out</button>}</>;
}
