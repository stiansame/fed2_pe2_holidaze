import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../Icon.jsx';
import DeleteVenue from './DeleteVenue.jsx';
import { navigationOrigin } from '../../utils/navigation.js';

export default function VenueOwnerActions({ venue, className = '' }) {
  const menu = useRef(null);
  const location = useLocation();

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

  return <details ref={menu} className={`relative shrink-0 ${className}`}>
    <summary aria-label="Manage your venue" className="flex size-12 cursor-pointer list-none items-center justify-center rounded-lg border border-border bg-surface text-primary hover:bg-tint [&::-webkit-details-marker]:hidden"><Icon name="edit" /></summary>
    <nav aria-label="Venue actions" className="absolute right-0 z-40 mt-2 grid min-w-48 gap-2 rounded-xl border border-border bg-surface p-2 shadow-lg">
      <Link to={`/manager/venues/${encodeURIComponent(venue.id)}/edit`} state={navigationOrigin(location)} className="navigation-link gap-2"><Icon name="edit" />Edit venue</Link>
      <DeleteVenue venue={venue} />
    </nav>
  </details>;
}
