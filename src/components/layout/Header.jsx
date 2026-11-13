import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Logo.jsx';
import MobileMenu from './MobileMenu.jsx';
import NavigationLinks from './NavigationLinks.jsx';
import Icon from '../Icon.jsx';
import { toggleSunnyMode } from '../../utils/theme.js';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sunny, setSunny] = useState(() => typeof document !== 'undefined' && document.documentElement.dataset.theme === 'sunny');
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
        <div className="flex items-center gap-2 sm:gap-4">
        <nav aria-label="Main navigation" className="hidden gap-4 lg:flex">
          <NavigationLinks />
        </nav>
        <button type="button" aria-label="Sunny mode" aria-pressed={sunny} title={sunny ? 'Switch to standard theme' : 'Switch to Sunny mode'} onClick={() => setSunny(toggleSunnyMode())} className="theme-toggle flex size-11 shrink-0 items-center justify-center rounded-full text-primary hover:bg-tint">
          <Icon name="sun" />
        </button>
        <button
          ref={menuButton}
          type="button"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-controls={menuOpen ? 'mobile-menu' : undefined}
          onClick={() => menuOpen ? closeMenu() : setMenuOpen(true)}
          className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-border text-primary hover:bg-tint lg:hidden"
        >
          <Icon name={menuOpen ? 'close' : 'menu'} />
        </button>
        </div>
      </div>
      {menuOpen && <MobileMenu onClose={closeMenu} />}
    </header>
  );
}
