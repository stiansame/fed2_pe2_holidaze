import { guestCountError } from "../utils/availability.js";

/**
 * Renders a numeric guest field bounded by the allowed capacity.
 * @param {object} props Component props.
 * @param {number|string} props.value Guest count, or an empty input.
 * @param {Function} props.onChange Receives a number or an empty input.
 * @param {number} [props.maxGuests] Maximum allowed guest count.
 * @param {boolean} [props.allowAny] An empty search field means any capacity.
 * @param {string} [props.describedBy] ID of the field's hint or error message.
 * @param {string} [props.className] Additional styling classes.
 * @returns {import('react').ReactNode}
 */
export default function GuestSelect({
  value,
  onChange,
  maxGuests = 100,
  allowAny = false,
  describedBy,
  className = "",
}) {
  const capacity = Number.isInteger(maxGuests) && maxGuests > 0 ? maxGuests : 0;
  const minimum = allowAny ? 0 : 1;
  const error = guestCountError(value, capacity, minimum);
  return (
    <input
      type="number"
      inputMode="numeric"
      min={minimum}
      max={capacity}
      step="1"
      value={allowAny && value === 0 ? "" : Number.isNaN(value) ? "" : value}
      placeholder={allowAny ? "Any" : "Guests"}
      onChange={(event) =>
        onChange(
          event.target.value === ""
            ? allowAny
              ? 0
              : ""
            : event.target.valueAsNumber,
        )
      }
      required={!allowAny}
      disabled={!capacity}
      aria-invalid={Boolean(error)}
      aria-describedby={describedBy}
      className={className}
    />
  );
}
