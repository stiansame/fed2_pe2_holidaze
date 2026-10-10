import { useEffect, useRef } from 'react';
import NavigationLinks from './NavigationLinks.jsx';

export default function MobileMenu({ onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    menuRef.current.querySelector('a').focus();
  }, []);

  return (
    <nav
      id="mobile-menu"
      ref={menuRef}
      aria-label="Mobile navigation"
      className="space-y-8 bg-background p-6 md:hidden"
      onKeyDown={event => {
        if (event.key === 'Escape') onClose();
      }}
    >
      <h2 className="text-h3 font-semibold">Menu</h2>
      <NavigationLinks mobile onNavigate={onClose} />
      <button type="button" onClick={onClose} className="min-h-12 w-full rounded-lg border border-border bg-surface px-4 text-small font-semibold text-primary hover:bg-tint">
        Close menu
      </button>
    </nav>
  );
}
