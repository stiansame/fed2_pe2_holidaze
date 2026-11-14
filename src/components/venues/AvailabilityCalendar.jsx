import { messages } from '../../constants/messages.js';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Icon from '../Icon.jsx';
import GuestSelect from '../GuestSelect.jsx';
import { navigationOrigin } from '../../utils/navigation.js';
import { addDays, bookedPeriods, dateKey, overlaps, stayFromSearch, staySummary, validateStay, validDate } from '../../utils/availability.js';
import BookingPrice from './BookingPrice.jsx';

const inputClass = 'mt-1 h-11 w-full min-w-0 rounded-lg border border-border bg-surface px-2';
const fullDate = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeZone: 'UTC' });

export default function AvailabilityCalendar({ bookings, maxGuests, initialStay, onReserve, onStayChange, formId, price, compact = false, actionLabel = 'Reserve', readOnly = false, actions }) {
  const today = dateKey();
  const calendar = useRef(null);
  const { id } = useParams();
  const location = useLocation();
  const { search } = location;
  const navigate = useNavigate();
  const initial = initialStay ?? stayFromSearch(search);
  const [month, setMonth] = useState(validDate(initial.from) && (readOnly || initial.from >= today) ? initial.from.slice(0, 7) : today.slice(0, 7));
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [guests, setGuests] = useState(initial.guests);
  const [checked, setChecked] = useState(false);
  useEffect(() => { onStayChange?.({ from, to, guests }); }, [from, to, guests, onStayChange]);
  const summary = !compact && price === undefined ? null : staySummary({ bookings, maxGuests, price }, { from, to, guests });
  const { periods, reliable } = bookedPeriods(bookings, readOnly ? '0001-01-01' : today);
  const error = validateStay({ from, to, guests, maxGuests, periods: reliable ? periods : null, today });
  const start = `${month}-01`;
  const monthDate = new Date(`${start}T00:00:00Z`);
  const days = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 0)).getUTCDate();
  const offset = (monthDate.getUTCDay() + 6) % 7;

  function changeMonth(direction) {
    const date = new Date(`${start}T00:00:00Z`);
    date.setUTCMonth(date.getUTCMonth() + direction);
    setMonth(date.toISOString().slice(0, 7));
  }

  function selectDate(date) {
    setChecked(false);
    if (!from || to || date <= from) {
      setFrom(date);
      setTo('');
    } else {
      setTo(date);
    }
  }

  const dates = <dl className={`grid min-w-0 ${compact ? 'grid-cols-[auto_auto] justify-start gap-x-6 lg:grid-cols-2' : 'grid-cols-2'} gap-2 text-left text-small`} aria-live="polite">
    {[['Check-in', from], ['Check-out', to]].map(([label, date]) => <div key={label} className="min-w-0"><dt className="text-muted">{label}</dt><dd className="font-semibold">{date ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', ...(compact ? {} : { year: 'numeric' }), timeZone: 'UTC' }) : 'Not selected'}</dd></div>)}
  </dl>;

  return <section ref={calendar} className={`${compact ? 'compact-calendar space-y-2 p-3 lg:space-y-4 lg:p-4' : 'space-y-4 p-4'} border-t border-border`} aria-label="Availability">
    <h2 className={`${compact ? 'sr-only lg:not-sr-only ' : ''}text-h3 font-bold`}>{readOnly ? 'Venue calendar' : 'Select dates'}</h2>
    {periods === null ? <p role="alert" className="text-small text-danger">{messages.availabilityUnavailable}</p> : <>
      {!reliable && <p role="alert" className="text-small text-danger">{messages.invalidBookingDates}</p>}
      <div className="flex items-center justify-between gap-1">
        <button type="button" aria-label="Previous month" disabled={!readOnly && month <= today.slice(0, 7)} onClick={() => changeMonth(-1)} className="flex size-11 shrink-0 items-center justify-center rounded-lg text-primary hover:bg-tint disabled:opacity-30"><Icon name="left" /></button>
        <p aria-live="polite" className="text-small font-semibold">{monthDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</p>
        <button type="button" aria-label="Next month" onClick={() => changeMonth(1)} className="flex size-11 shrink-0 items-center justify-center rounded-lg text-primary hover:bg-tint"><Icon name="right" /></button>
      </div>
      {!readOnly && <p aria-live="polite" className="text-small font-semibold">{to ? 'Click a date to start a new selection.' : from ? 'Choose check-out' : 'Choose check-in'}</p>}
      <div className="grid grid-cols-7 gap-1 text-center text-caption" role="group" aria-label="Night availability">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => <span key={day} className="py-2 font-semibold text-muted">{day}</span>)}
        {Array.from({ length: offset }, (_, i) => <span key={`space-${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const date = `${month}-${String(i + 1).padStart(2, '0')}`;
          const past = date < today;
          const booked = overlaps(date, addDays(date, 1), periods);
          const choosingEnd = from && !to && date > from;
          const disabled = past || !reliable || (choosingEnd ? overlaps(from, date, periods) : booked);
          const selected = readOnly ? Boolean(from && to && date >= from && date < to) : date === from || date === to || (date > from && date < to);
          const stateClass = readOnly && selected ? 'bg-success/15 font-semibold text-success' : past ? 'bg-calendar-past text-calendar-past-text line-through'
            : booked ? 'bg-danger/10 text-danger'
            : selected ? 'bg-success/15 font-semibold text-success' : disabled ? 'bg-border/50 text-muted' : 'text-text hover:bg-tint';
          return <button type="button" key={date} disabled={readOnly || disabled} onClick={() => selectDate(date)} aria-pressed={selected} aria-label={`${fullDate.format(new Date(date))}: ${readOnly && selected ? 'This booking' : past ? 'Past, unavailable' : booked ? 'Booked night' : disabled ? 'Unavailable for this stay' : 'Available night'}${!readOnly && choosingEnd && !disabled ? ', checkout available' : ''}`} aria-current={date === today ? 'date' : undefined} className={`flex min-h-11 items-center justify-center rounded ${readOnly ? 'disabled:cursor-default' : 'disabled:cursor-not-allowed'} ${stateClass} ${readOnly ? selected ? 'ring-1 ring-success' : '' : date === from || date === to ? 'ring-2 ring-success' : ''}`}>{i + 1}</button>;
        })}
      </div>
      <p className={`${compact ? 'hidden lg:block ' : ''}text-caption text-muted`}>{readOnly ? 'Green: this booking · Red: other bookings · Grey: past. Check-out dates are not included in booked nights.' : 'Grey: past · Red: booked nights · Green: selected. Checkout is allowed on the next booking’s check-in date.'}</p>
      {readOnly && dates}
      {!readOnly && <form id={formId} className="space-y-3" onChange={() => setChecked(false)} onSubmit={event => {
        event.preventDefault();
        setChecked(true);
        if (error) return;
        if (onReserve) return onReserve({ from, to, guests });
        const params = new URLSearchParams(search);
        for (const [key, value] of Object.entries({ from, to, guests })) params.set(key, value);
        navigate(`/venues/${encodeURIComponent(id)}/reserve?${params}`, { state: navigationOrigin(location) });
      }}>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-2 gap-y-3">
          <div className="col-span-2 min-w-0">{dates}</div>
          <label className={`${compact ? 'flex items-center justify-start gap-3 lg:block' : 'block'} min-w-0 text-left text-small`}>{compact ? <strong className="shrink-0">Who’s coming?</strong> : 'Guests'}<GuestSelect value={guests} onChange={setGuests} maxGuests={maxGuests} className={compact ? 'h-11 w-36 min-w-0 rounded-lg border border-border bg-surface px-2 lg:mt-1 lg:w-full' : inputClass} /></label>
          <button type="button" aria-label="Reset selection" title="Reset selection" disabled={!from && !to} onClick={() => { setFrom(''); setTo(''); setChecked(false); }} className="inline-flex size-11 items-center justify-center rounded-lg border border-border bg-surface text-primary hover:bg-tint disabled:opacity-40"><Icon name="reset" /></button>
        </div>
        <div className={compact ? 'booking-action-row sticky bottom-0 bg-surface pt-2 lg:block' : actions ? 'grid grid-cols-2 items-stretch gap-2' : ''}>
          {summary && <div className="lg:hidden"><BookingPrice price={price} stay={{ from, to, guests }} summary={summary} /></div>}
          {compact && <div className="lg:hidden">{(from || to) && <button type="button" aria-label="Change dates and guests" title="Change dates and guests" className="edit-icon-button" onClick={() => calendar.current.querySelector('button[aria-pressed="true"]:not(:disabled)')?.focus()}><Icon name="edit" /></button>}</div>}
          {actions}
          <button disabled={!reliable || !from || !to || !Number.isInteger(maxGuests) || maxGuests < 1} className={compact ? 'booking-action-button lg:w-full' : 'booking-action-button w-full'}>{actionLabel}</button>
        </div>
        {checked && error && <p role="alert" className="text-small text-danger">{error}</p>}
      </form>}
    </>}
  </section>;
}
