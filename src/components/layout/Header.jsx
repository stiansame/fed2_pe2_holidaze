import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import mark from '../../assets/holidaze-mark.svg';
import MobileMenu from './MobileMenu.jsx';
import NavigationLinks from './NavigationLinks.jsx';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);

  function closeMenu() {
    setMenuOpen(false);
    menuButton.current.focus();
  }

  return (
    <header className="bg-surface">
      <div className="mx-auto flex max-w-360 items-center justify-between gap-4 p-4 md:p-8">
        <Link to="/" aria-label="Holidaze home" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <img src={mark} alt="" width="40" height="32" />
          <span className="text-h3 font-semibold">Holidaze</span>
        </Link>
        <nav aria-label="Main navigation" className="hidden gap-4 md:flex">
          <NavigationLinks />
        </nav>
        <button
          ref={menuButton}
          type="button"
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? 'mobile-menu' : undefined}
          onClick={() => menuOpen ? closeMenu() : setMenuOpen(true)}
          className="min-h-12 min-w-20 rounded-lg border border-border px-4 text-small font-semibold text-primary hover:bg-tint md:hidden"
        >
          Menu
        </button>
      </div>
      {menuOpen && <MobileMenu onClose={closeMenu} />}
    </header>
  );
}
