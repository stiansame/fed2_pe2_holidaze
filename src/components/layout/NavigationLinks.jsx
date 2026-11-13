import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.js';
import HostAvatar from '../HostAvatar.jsx';
import Icon from '../Icon.jsx';

export default function NavigationLinks({ mobile = false, onNavigate }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const itemClass = `inline-flex items-center justify-center gap-2 rounded-lg border text-small font-semibold ${mobile ? 'h-20 min-w-0 w-full flex-col px-1' : 'h-11 min-w-30 px-4'}`;
  const links = [
    { to: '/venues', label: 'Explore', icon: 'compass' },
    ...(user ? [
      { to: '/profile', label: user.name, account: true },
    ] : [
      { to: '/login', label: mobile ? 'Login' : 'Log in', icon: 'login' },
      { to: '/register', label: 'Get started', primary: true, icon: 'user-plus' },
    ]),
  ];

  return <>{links.map(({ to, label, primary, account, icon }) => (
    <NavLink
      key={to}
      to={to}
      onClick={onNavigate}
      className={({ isActive }) => `${itemClass} ${primary ? 'border-primary bg-primary text-surface hover:bg-primary-hover' : `border-border text-primary hover:bg-tint ${isActive ? 'bg-tint' : 'bg-surface'}`}`}
    >
      {mobile && icon && <Icon name={icon} className="size-6 shrink-0" />}
      {account && <HostAvatar key={(profile ? profile.avatar : user.avatar)?.url} media={profile ? profile.avatar : user.avatar} className="size-8" />}
      <span className="max-w-full truncate">{label}</span>
    </NavLink>
  ))}{user && <button type="button" className={`${itemClass} border-border bg-surface text-primary hover:bg-tint`} onClick={() => {
    logout();
    onNavigate?.();
    navigate('/', { replace: true });
  }}>{mobile && <Icon name="logout" className="size-6 shrink-0" />}<span>Log out</span></button>}</>;
}
