import { messages } from "../constants/messages.js";

/**
 * Creates a local ISO calendar key for comparisons and API values, not display.
 * @param {Date} [date=new Date()] Local calendar date.
 * @returns {string}
 */
export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/**
 * Moves an ISO calendar date by whole days using UTC arithmetic.
 * @param {string} date Calendar date in YYYY-MM-DD format.
 * @param {number} days Number of days to add; negative values move backwards.
 * @returns {string}
 * @throws {RangeError} If the input cannot produce a valid date.
 */
export function addDays(date, days) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

/**
 * Checks that a YYYY-MM-DD value represents a real calendar date.
 * @param {string} date Date to validate.
 * @returns {boolean}
 */
export function validDate(date) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(date) &&
    Number.isFinite(Date.parse(date)) &&
    new Date(date).toISOString().slice(0, 10) === date
  );
}

/**
 * Reads stay dates and guest count from URL parameters.
 * @param {string} search URL query string.
 * @returns {{from: string, to: string, guests: number}}
 */
export function stayFromSearch(search) {
  const params = new URLSearchParams(search);
  return {
    from: validDate(params.get("from")) ? params.get("from") : "",
    to: validDate(params.get("to")) ? params.get("to") : "",
    guests: params.has("guests") ? Number(params.get("guests")) : 1,
  };
}

/**
 * Validates a stay and calculates its cost, excluding an edited booking when supplied.
 * @param {object} venue Venue with capacity, price and booking data.
 * @param {object} stay Selected from/to dates in YYYY-MM-DD format and guest count.
 * @param {string} [bookingId] Booking to exclude from availability checks.
 * @returns {{error: string, nights?: number, total?: number}}
 */
export function staySummary(venue, stay, bookingId) {
  const { periods, reliable } = bookedPeriods(
    bookingId
      ? venue.bookings?.filter((booking) => booking.id !== bookingId)
      : venue.bookings,
  );
  const error = validateStay({
    ...stay,
    maxGuests: venue.maxGuests,
    periods: reliable ? periods : null,
  });
  if (error) return { error };
  const price = stayPrice(venue.price, stay.from, stay.to);
  return price ? { error: "", ...price } : { error: messages.invalidStayPrice };
}

/**
 * Calculates nights and total cost for a valid date range.
 * @param {number} price Nightly rate.
 * @param {string} from Check-in date in YYYY-MM-DD format.
 * @param {string} to Check-out date in YYYY-MM-DD format.
 * @returns {{nights: number, total: number}|null}
 */
export function stayPrice(price, from, to) {
  if (
    !validDate(from) ||
    !validDate(to) ||
    to <= from ||
    !Number.isFinite(price) ||
    price < 0
  )
    return null;
  const nights = (Date.parse(to) - Date.parse(from)) / 86400000;
  return { nights, total: (Math.round(price * 100) * nights) / 100 };
}

/**
 * Extracts usable booking ranges and flags unreliable availability data.
 * @param {object[]|undefined} bookings Venue booking records.
 * @param {string} [today=dateKey()] Local date in YYYY-MM-DD format.
 * @returns {{periods: Array<[string, string]>|null, reliable: boolean}}
 */
export function bookedPeriods(bookings, today = dateKey()) {
  if (!Array.isArray(bookings)) return { periods: null, reliable: false };
  const periods = bookings.map((booking) =>
    [booking?.dateFrom, booking?.dateTo].map((value) =>
      typeof value === "string" ? value.slice(0, 10) : "",
    ),
  );
  // Legacy bookings can have reversed or equal dates. Ignore them only when both dates are past.
  const upcoming = periods.filter(
    ([from, to]) =>
      !(validDate(from) && validDate(to) && from < today && to < today),
  );
  const valid = upcoming.filter(
    ([from, to]) => validDate(from) && validDate(to) && from < to,
  );
  return { periods: valid, reliable: valid.length === upcoming.length };
}

/**
 * Checks for overlapping stays, excluding the check-out date.
 * @param {string} from Check-in date in YYYY-MM-DD format.
 * @param {string} to Check-out date in YYYY-MM-DD format.
 * @param {Array<[string, string]>} periods Booked date ranges.
 * @returns {boolean}
 */
export function overlaps(from, to, periods) {
  return periods.some(([start, end]) => from < end && to > start);
}

/**
 * Checks whole guest counts against known capacity and the allowed minimum.
 * @param {number|string} guests Requested count, or an empty input.
 * @param {number} maxGuests Maximum allowed count.
 * @param {number} [minimum=1] Minimum count; zero allows unrestricted search.
 * @returns {string} A validation message, or an empty string for a valid count.
 */
export function guestCountError(guests, maxGuests, minimum = 1) {
  if (!Number.isInteger(maxGuests) || maxGuests < 1)
    return messages.invalidStayGuests;
  if (!Number.isInteger(guests) || guests < minimum || guests > maxGuests)
    return messages.guestCountRange(minimum, maxGuests);
  return "";
}

/**
 * Checks dates, guest capacity and availability before a reservation proceeds.
 * @param {object} stay Stay and availability values.
 * @param {string} stay.from Check-in date in YYYY-MM-DD format.
 * @param {string} stay.to Check-out date in YYYY-MM-DD format.
 * @param {number|string} stay.guests Requested guest count, or an empty input.
 * @param {number} stay.maxGuests Venue capacity.
 * @param {Array<[string, string]>|null} stay.periods Booked ranges, or null when availability is unknown.
 * @param {string} [stay.today=dateKey()] Local calendar date.
 * @returns {string} An error message, or an empty string for a valid stay.
 */
export function validateStay({
  from,
  to,
  guests,
  maxGuests,
  periods,
  today = dateKey(),
}) {
  if (periods === null) return messages.availabilityUnavailable;
  if (!validDate(from) || !validDate(to)) return messages.invalidStayDates;
  if (from < today) return messages.pastCheckIn;
  if (to <= from) return messages.invalidCheckOut;
  const guestError = guestCountError(guests, maxGuests);
  if (guestError) return guestError;
  if (overlaps(from, to, periods)) return messages.overlappingStay;
  return "";
}
