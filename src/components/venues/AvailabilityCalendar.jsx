import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Icon from '../Icon.jsx';
import { addDays, bookedPeriods, dateKey, overlaps, stayFromSearch, validateStay } from '../../utils/availability.js';

const inputClass = 'mt-1 min-h-12 w-full min-w-0 rounded-lg border border-border bg-surface px-2';
const fullDate = new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeZone: 'UTC' });

export default function AvailabilityCalendar({ bookings, maxGuests }) {
  const today = dateKey();
  const { id } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const initial = stayFromSearch(search);
  const [month, setMonth] = useState(initial.from >= today ? initial.from.slice(0, 7) : today.slice(0, 7));
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [guests, setGuests] = useState(initial.guests);
  const [checked, setChecked] = useState(false);
  const { periods, reliable } = bookedPeriods(bookings, today);
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

  return <section className="space-y-4 border-t border-border p-4" aria-label="Availability">
    <h2 className="text-h3 font-bold">Select dates</h2>
    {periods === null ? <p role="alert" className="text-small text-danger">Availability is unavailable. Please try again later.</p> : <>
      {!reliable && <p role="alert" className="text-small text-danger">Some booking dates are invalid. Known bookings are shown, but availability cannot be confirmed.</p>}
      <div className="flex items-center justify-between gap-1">
        <button type="button" aria-label="Previous month" disabled={month <= today.slice(0, 7)} onClick={() => changeMonth(-1)} className="flex size-11 shrink-0 items-center justify-center rounded-lg text-primary hover:bg-tint disabled:opacity-30"><Icon name="left" /></button>
        <p aria-live="polite" className="text-small font-semibold">{monthDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</p>
        <button type="button" aria-label="Next month" onClick={() => changeMonth(1)} className="flex size-11 shrink-0 items-center justify-center rounded-lg text-primary hover:bg-tint"><Icon name="right" /></button>
      </div>
      <p aria-live="polite" className="text-small font-semibold">{to ? 'Click a date to start a new selection.' : from ? 'Choose check-out' : 'Choose check-in'}</p>
      <div className="grid grid-cols-7 gap-1 text-center text-caption" aria-label="Night availability">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => <span key={day} className="py-2 font-semibold text-muted">{day}</span>)}
        {Array.from({ length: offset }, (_, i) => <span key={`space-${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const date = `${month}-${String(i + 1).padStart(2, '0')}`;
          const past = date < today;
          const booked = overlaps(date, addDays(date, 1), periods);
          const choosingEnd = from && !to && date > from;
          const disabled = past || !reliable || (choosingEnd ? overlaps(from, date, periods) : booked);
          const selected = date === from || date === to || (date > from && date < to);
          const stateClass = past ? 'bg-border text-muted line-through'
            : booked ? 'bg-danger/10 text-danger'
            : selected ? 'bg-success/15 font-semibold text-success' : disabled ? 'bg-border/50 text-muted' : 'text-text hover:bg-tint';
          return <button type="button" key={date} disabled={disabled} onClick={() => selectDate(date)} aria-pressed={selected} aria-label={`${fullDate.format(new Date(date))}: ${past ? 'Past, unavailable' : booked ? 'Booked night' : disabled ? 'Unavailable for this stay' : 'Available night'}${choosingEnd && !disabled ? ', checkout available' : ''}`} aria-current={date === today ? 'date' : undefined} className={`flex min-h-11 items-center justify-center rounded disabled:cursor-not-allowed ${stateClass} ${date === from || date === to ? 'ring-2 ring-success' : ''}`}>{i + 1}</button>;
        })}
      </div>
      <p className="text-caption text-muted">Grey: past · Red: booked nights · Green: selected. Checkout is allowed on the next booking’s check-in date.</p>
      <dl className="grid grid-cols-2 gap-2 text-small" aria-live="polite">
        {[['Check-in', from], ['Check-out', to]].map(([label, date]) => <div key={label}><dt className="text-muted">{label}</dt><dd className="font-semibold">{date ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : 'Not selected'}</dd></div>)}
      </dl>
      <form className="space-y-3" onChange={() => setChecked(false)} onSubmit={event => {
        event.preventDefault();
        setChecked(true);
        if (error) return;
        const params = new URLSearchParams(search);
        for (const [key, value] of Object.entries({ from, to, guests })) params.set(key, value);
        navigate(`/venues/${encodeURIComponent(id)}/reserve?${params}`);
      }}>
        <label className="block text-small">Guests<input type="number" required min="1" max={maxGuests > 0 ? maxGuests : undefined} step="1" value={guests} onChange={event => setGuests(Number(event.target.value))} className={inputClass} /></label>
        <button disabled={!reliable || !from || !to} className="min-h-12 w-full rounded-lg bg-primary px-3 font-semibold text-surface hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60">Reserve</button>
        {checked && error && <p role="alert" className="text-small text-danger">{error}</p>}
      </form>
    </>}
  </section>;
}
