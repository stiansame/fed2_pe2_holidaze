import { NavLink } from 'react-router-dom';

export default function NavigationLinks({ mobile = false, onNavigate }) {
  const links = [
    { to: '/venues', label: mobile ? 'Explore venues' : 'Explore' },
    { to: '/login', label: 'Log in' },
    { to: '/register', label: mobile ? 'Create account' : 'Get started', primary: !mobile },
  ];

  return links.map(({ to, label, primary }) => (
    <NavLink
      key={to}
      to={to}
      onClick={onNavigate}
      className={({ isActive }) => `inline-flex min-h-12 items-center justify-center rounded-lg border px-4 text-small font-semibold ${mobile ? 'w-full' : 'min-w-30'} ${primary ? 'border-primary bg-primary text-surface hover:bg-primary-hover' : `border-border text-primary hover:bg-tint ${isActive ? 'bg-tint' : 'bg-surface'}`}`}
    >
      {label}
    </NavLink>
  ));
}
