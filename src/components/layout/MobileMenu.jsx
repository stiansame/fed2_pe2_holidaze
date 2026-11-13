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
      className="grid grid-cols-3 gap-2 bg-background p-4 lg:hidden"
      onKeyDown={event => {
        if (event.key === 'Escape') onClose();
      }}
    >
      <NavigationLinks mobile onNavigate={onClose} />
    </nav>
  );
}
