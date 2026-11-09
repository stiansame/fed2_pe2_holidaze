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
      className="space-y-8 bg-background p-6 lg:hidden"
      onKeyDown={event => {
        if (event.key === 'Escape') onClose();
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-h3 font-semibold">Menu</h2>
      </div>
      <NavigationLinks mobile onNavigate={onClose} />
    </nav>
  );
}
