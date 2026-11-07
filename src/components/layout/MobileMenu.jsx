import { useEffect, useRef } from 'react';
import NavigationLinks from './NavigationLinks.jsx';
import Icon from '../Icon.jsx';

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
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-h3 font-semibold">Menu</h2>
        <button type="button" aria-label="Close menu" onClick={onClose} className="flex size-12 items-center justify-center rounded-lg border border-border bg-surface text-primary hover:bg-tint">
          <Icon name="close" />
        </button>
      </div>
      <NavigationLinks mobile onNavigate={onClose} />
    </nav>
  );
}
