export default function GuestSelect({ value, onChange, maxGuests = 100, allowAny = false, className = '' }) {
  const capacity = Number.isInteger(maxGuests) && maxGuests > 0 ? maxGuests : 0;
  const valid = capacity > 0 && Number.isInteger(value) && value >= (allowAny ? 0 : 1) && value <= capacity;
  return <select value={valid ? value : ''} onChange={event => onChange(Number(event.target.value))}
    required={!allowAny} disabled={!capacity} aria-invalid={!valid} className={className}>
    {!capacity ? <option value="">Guest capacity unavailable</option>
      : !valid && <option value="" disabled>Choose guests</option>}
    {allowAny && capacity > 0 && <option value="0">Any</option>}
    {Array.from({ length: capacity }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} {index === 0 ? 'guest' : 'guests'}</option>)}
  </select>;
}
