import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

export default function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:rounded-lg focus:bg-surface focus:p-4">
        Skip to content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-360 flex-1 p-6 md:p-16">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
