/**
 * Renders a native guest selector bounded by the venue capacity.
 * @param {object} props Component props.
 * @param {number} props.value Selected guest count.
 * @param {Function} props.onChange Receives the selected value.
 * @param {number} [props.maxGuests] Maximum allowed guest count.
 * @param {boolean} [props.allowAny] Adds the unrestricted search choice.
 * @param {string} [props.className] Additional styling classes.
 * @returns {import('react').ReactNode}
 */
export default function GuestSelect({ value, onChange, maxGuests = 100, allowAny = false, className = '' }) {
  const capacity = Number.isInteger(maxGuests) && maxGuests > 0 ? maxGuests : 0;
  const valid = capacity > 0 && Number.isInteger(value) && value >= (allowAny ? 0 : 1) && value <= capacity;
  return <select value={valid ? value : ''} onChange={event => onChange(Number(event.target.value))}
    required={!allowAny} disabled={!capacity} aria-invalid={!valid} className={className}>
    {!capacity ? <option value="">Guest capacity unavailable</option>
      : (!allowAny || !valid) && <option value="" disabled>Choose guests</option>}
    {allowAny && capacity > 0 && <option value="0">Any</option>}
    {Array.from({ length: capacity }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} {index === 0 ? 'guest' : 'guests'}</option>)}
  </select>;
}
