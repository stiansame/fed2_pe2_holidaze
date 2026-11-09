import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Logo.jsx';
import MobileMenu from './MobileMenu.jsx';
import NavigationLinks from './NavigationLinks.jsx';
import Icon from '../Icon.jsx';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef(null);

  function closeMenu() {
    setMenuOpen(false);
    menuButton.current.focus();
  }

  return (
    <header className="border-b-4 border-accent bg-surface">
      <div className="mx-auto flex max-w-360 items-center justify-between gap-4 p-4 md:p-8">
        <Link to="/" aria-label="Holidaze home" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
          <Logo />
        </Link>
        <nav aria-label="Main navigation" className="hidden gap-4 lg:flex">
          <NavigationLinks />
        </nav>
        <button
          ref={menuButton}
          type="button"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-controls={menuOpen ? 'mobile-menu' : undefined}
          onClick={() => menuOpen ? closeMenu() : setMenuOpen(true)}
          className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border text-primary hover:bg-tint lg:hidden"
        >
          <Icon name={menuOpen ? 'close' : 'menu'} />
        </button>
      </div>
      {menuOpen && <MobileMenu onClose={closeMenu} />}
    </header>
  );
}
