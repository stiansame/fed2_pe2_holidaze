import { useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../Icon.jsx';
import AvailabilityCalendar from './AvailabilityCalendar.jsx';
import BookingPrice from './BookingPrice.jsx';
import { stayFromSearch, staySummary } from '../../utils/availability.js';
import { formatPrice, formatVenuePrice } from '../../utils/venue.js';

export default function VenueBooking({ venue }) {
  const { search } = useLocation();
  const [stay, setStay] = useState(() => stayFromSearch(search));
  const [open, setOpen] = useState(false);
  const dialog = useRef(null);
  const trigger = useRef(null);
  const formId = useId();
  const titleId = useId();
  const summary = staySummary(venue, stay);

  function openBooking() {
    dialog.current.showModal();
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const desktop = window.matchMedia('(min-width: 64rem)');
    const closeOnDesktop = () => { if (desktop.matches) dialog.current.close(); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      document.body.style.overflow = previous;
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, [open]);

  return <aside aria-label="Stay summary" className="min-w-0 lg:sticky lg:top-6 lg:overflow-hidden lg:rounded-xl lg:border lg:border-border lg:bg-surface">
    <dialog ref={dialog} aria-labelledby={titleId} className="venue-booking-panel bg-surface text-text backdrop:bg-black/60" onClose={() => { setOpen(false); trigger.current?.focus(); }} onClick={event => {
      if (event.target === event.currentTarget) {
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientY < bounds.top || event.clientX < bounds.left || event.clientX > bounds.right) dialog.current.close();
      }
    }}>
      <div className="flex items-center justify-between gap-3 px-3 lg:hidden">
        <h2 id={titleId} className="text-h3 font-bold">Your stay</h2>
        <button type="button" aria-label="Close booking" autoFocus onClick={() => dialog.current.close()} className="flex size-12 items-center justify-center rounded-lg text-primary hover:bg-tint"><Icon name="close" /></button>
      </div>
      <div className="hidden bg-primary p-6 text-surface lg:block">
        <p className="text-small font-semibold">Your stay</p>
        <p className="mt-2 text-h3 font-semibold" aria-live="polite">{summary.error ? formatVenuePrice(venue.price) : `${formatPrice(summary.total)} total`}</p>
        {!summary.error && <p className="mt-1 text-small">{summary.nights} {summary.nights === 1 ? 'night' : 'nights'} · {formatVenuePrice(venue.price)}</p>}
      </div>
      <AvailabilityCalendar bookings={venue.bookings} maxGuests={venue.maxGuests} onStayChange={setStay} formId={formId} price={venue.price} compact />
    </dialog>
    <div className="venue-booking-bar booking-action-row fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface px-3 pt-3 lg:hidden">
      <BookingPrice price={venue.price} stay={stay} summary={summary} />
      <div>{(stay.from || stay.to) && <button type="button" aria-label="Change dates and guests" title="Change dates and guests" onClick={openBooking} className="edit-icon-button"><Icon name="edit" /></button>}</div>
      <button ref={trigger} type={summary.error ? 'button' : 'submit'} form={summary.error ? undefined : formId} aria-haspopup={summary.error ? 'dialog' : undefined} onClick={summary.error ? openBooking : undefined} className="booking-action-button">{summary.error ? 'Select dates' : 'Reserve'}</button>
    </div>
  </aside>;
}
