import { dateKey, validDate, stayPrice } from "./availability.js";

/**
 * Extracts calendar dates and guest count from a booking.
 * @param {object} booking Booking containing dates, guests and related venue data.
 * @returns {{from: string, to: string, guests: number|undefined}}
 */
export function bookingDates(booking) {
  return {
    from: booking.dateFrom?.slice(0, 10) ?? "",
    to: booking.dateTo?.slice(0, 10) ?? "",
    guests: booking.guests,
  };
}

/**
 * Classifies a booking using its arrival and departure dates.
 * @param {object} booking Booking containing dates, guests and related venue data.
 * @param {string} [today=dateKey()] Local date in YYYY-MM-DD format.
 * @returns {'past'|'current'|'upcoming'|'unknown'}
 */
export function bookingStatus(booking, today = dateKey()) {
  const { from, to } = bookingDates(booking);
  if (!validDate(from) || !validDate(to) || to <= from) return "unknown";
  return to <= today ? "past" : from <= today ? "current" : "upcoming";
}

/**
 * Calculates a booking's cost using the venue's current nightly rate.
 * @param {object} booking Booking containing dates, guests and related venue data.
 * @returns {{nights: number, total: number}|null}
 */
export function bookingPrice(booking) {
  const { from, to } = bookingDates(booking);
  return stayPrice(booking.venue?.price, from, to);
}

/**
 * Groups stays by status, combining current and upcoming stays in arrival order.
 * @param {object[]} bookings Bookings to group.
 * @param {string} [today=dateKey()] Local date in YYYY-MM-DD format.
 * @returns {{upcoming: object[], past: object[], unknown: object[]}}
 */
export function groupBookings(bookings, today = dateKey()) {
  const groups = { upcoming: [], past: [], unknown: [] };
  for (const booking of bookings) {
    const status = bookingStatus(booking, today);
    groups[status === "current" ? "upcoming" : status].push(booking);
  }
  groups.upcoming.sort((a, b) => a.dateFrom.localeCompare(b.dateFrom));
  groups.past.sort((a, b) => b.dateTo.localeCompare(a.dateTo));
  return groups;
}

/**
 * Formats a date for English display, with a fallback for missing or invalid values.
 * @param {string} [value] ISO date or timestamp.
 * @returns {string}
 */
export function formatBookingDate(value) {
  const date = value?.slice(0, 10);
  return validDate(date)
    ? new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      })
    : "Date unavailable";
}

/**
 * Formats a short date range without repeating shared months and years.
 * @param {object} booking Booking containing dates, guests and related venue data.
 * @returns {string}
 */
export function formatBookingRange(booking) {
  const from = formatBookingDate(booking.dateFrom);
  const to = formatBookingDate(booking.dateTo);
  if (from === "Date unavailable" || to === "Date unavailable")
    return "Dates unavailable";
  const sameYear = booking.dateFrom.slice(0, 4) === booking.dateTo.slice(0, 4);
  const sameMonth =
    sameYear && booking.dateFrom.slice(0, 7) === booking.dateTo.slice(0, 7);
  return `${sameMonth ? from.split(" ")[0] : sameYear ? from.replace(/ \d{4}$/, "") : from}–${to}`;
}

/**
 * Builds five profile statistics; invalid booking dates leave the night total unknown.
 * @param {object[]|null|undefined} bookings Bookings, or an unavailable list.
 * @param {string} [today=dateKey()] Local date in YYYY-MM-DD format.
 * @param {boolean} [personal=false] Uses My stays instead of Total bookings.
 * @returns {Array<[string, number|null|undefined, string, boolean]>}
 */
export function guestSummary(bookings, today = dateKey(), personal = false) {
  const counts = { past: 0, upcoming: 0, current: 0, unknown: 0 };
  let nights = 0;
  for (const booking of bookings ?? []) {
    const status = bookingStatus(booking, today);
    counts[status]++;
    if (status !== "unknown") {
      const { from, to } = bookingDates(booking);
      nights += stayPrice(0, from, to).nights;
    }
  }
  return [
    [
      personal ? "My stays" : "Total bookings",
      bookings?.length,
      "calendar",
      true,
    ],
    ["Completed stays", bookings ? counts.past : null, "calendar-check", true],
    ["Upcoming stays", bookings ? counts.upcoming : null, "bed", true],
    [
      "Nights booked",
      bookings && !counts.unknown ? nights : null,
      "moon",
      true,
    ],
    ["Current stays", bookings ? counts.current : null, "user", true],
  ];
}
