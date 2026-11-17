import { messages } from "../constants/messages.js";
import { groupBookings } from "./bookings.js";
import { dateKey } from "./availability.js";

/**
 * Attaches venues to bookings, removes duplicate IDs and separates booking statuses.
 * @param {object[]} venues Owned venues with complete booking lists.
 * @param {string} [today=dateKey()] Local date in YYYY-MM-DD format.
 * @returns {{upcoming: object[], current: object[], past: object[], unknown: object[]}}
 * @throws {Error} If a venue is missing booking data.
 */
export function managerBookingGroups(venues, today = dateKey()) {
  // Missing booking data must never appear as a confirmed zero.
  if (venues.some((venue) => !Array.isArray(venue.bookings)))
    throw new Error(messages.bookingInformationUnavailable);
  const bookings = [
    ...new Map(
      venues
        .flatMap((venue) =>
          venue.bookings.map((booking) => ({ ...booking, venue })),
        )
        .map((booking) => [booking.id, booking]),
    ).values(),
  ];
  return groupBookings(bookings, today, true);
}

/**
 * Calculates manager booking totals and the average of valid venue ratings.
 * @param {object[]} venues Owned venues with booking lists.
 * @param {string} [today=dateKey()] Local date in YYYY-MM-DD format.
 * @returns {{totalBookings: number, upcoming: object[], current: object[], averageRating: string|null}}
 */
export function managerSummary(venues, today = dateKey()) {
  const groups = managerBookingGroups(venues, today);
  const rated = venues.filter(
    (venue) =>
      Number.isFinite(venue.rating) && venue.rating > 0 && venue.rating <= 5,
  );
  return {
    totalBookings: Object.values(groups).reduce(
      (sum, bookings) => sum + bookings.length,
      0,
    ),
    upcoming: groups.upcoming,
    current: groups.current,
    averageRating: rated.length
      ? (
          rated.reduce((sum, venue) => sum + venue.rating, 0) / rated.length
        ).toFixed(1)
      : null,
  };
}
