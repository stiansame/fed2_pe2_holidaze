import { matchPath, Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

const titles = {
  '/': 'Home',
  '/venues': 'Explore venues',
  '/login': 'Log in',
  '/register': 'Register',
  '/profile': 'Profile',
  '/bookings': 'My bookings',
  '/manager': 'Manager',
  '/manager/venues': 'My venues',
  '/manager/venues/new': 'Create venue',
  '/manager/bookings': 'Venue bookings',
};

export default function Layout() {
  const { pathname } = useLocation();
  const isVenueDetails = !!matchPath('/venues/:id', pathname);
  const isAccount = /^\/(profile|bookings|manager)(\/|$)/.test(pathname);
  const title = titles[pathname.replace(/\/+$/, '') || '/'] || 'Page not found';
  return (
    <div className="flex min-h-dvh flex-col bg-linear-to-br from-accent/10 via-background to-tint/40">
      {!isVenueDetails && <title>{`Holidaze | ${title}`}</title>}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:rounded-lg focus:bg-surface focus:p-4">
        Skip to content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className={`mx-auto w-full max-w-360 flex-1 ${isVenueDetails || isAccount || pathname === '/' ? 'p-4 md:p-8' : 'p-6 md:p-16'}`}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
