import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';

export default function EditMenu({ label, children, above = false }) {
  const menu = useRef(null);

  useEffect(() => {
    function close(event) {
      if (!menu.current.open || menu.current.querySelector('dialog[open]')) return;
      if (event.type === 'pointerdown' && !menu.current.contains(event.target)) menu.current.open = false;
      if (event.key === 'Escape') {
        menu.current.open = false;
        menu.current.querySelector('summary').focus();
      }
    }
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', close);
    };
  }, []);

  return <details ref={menu} className="relative shrink-0">
    <summary aria-label={label} className="edit-icon-button cursor-pointer list-none [&::-webkit-details-marker]:hidden"><Icon name="edit" /></summary>
    <nav aria-label={label} className={`absolute right-0 z-40 grid w-48 gap-1 rounded-xl border border-border bg-surface p-2 shadow-lg ${above ? 'bottom-full mb-2' : 'top-full mt-2'}`}>
      {children}
    </nav>
  </details>;
}
