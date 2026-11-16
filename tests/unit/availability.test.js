import { expect, test } from "vitest";
import {
  guestCountError,
  overlaps,
  stayPrice,
  validDate,
  validateStay,
} from "../../src/utils/availability.js";
import { messages } from "../../src/constants/messages.js";

test("validates leap days and rejects impossible dates", () => {
  expect(validDate("2028-02-29")).toBe(true);
  expect(validDate("2027-02-29")).toBe(false);
  expect(validDate("2028-04-31")).toBe(false);
});

test("calculates nights and price across a daylight-saving change", () => {
  expect(stayPrice(1250.5, "2027-03-27", "2027-03-29")).toEqual({
    nights: 2,
    total: 2501,
  });
  expect(stayPrice(100, "2027-03-29", "2027-03-29")).toBeNull();
});

test("blocks overlapping nights but permits same-day guest changeover", () => {
  const periods = [["2027-06-10", "2027-06-13"]];
  expect(overlaps("2027-06-09", "2027-06-11", periods)).toBe(true);
  expect(overlaps("2027-06-08", "2027-06-10", periods)).toBe(false);
  expect(overlaps("2027-06-13", "2027-06-15", periods)).toBe(false);
});

test.each([
  [{}, ""],
  [{ periods: null }, messages.availabilityUnavailable],
  [{ from: "2027-05-31" }, messages.pastCheckIn],
  [{ to: "2027-06-10" }, messages.invalidCheckOut],
  [{ guests: 5 }, messages.guestCountRange(1, 4)],
  [{ periods: [["2027-06-11", "2027-06-14"]] }, messages.overlappingStay],
])("validates a reservation before proceeding: %j", (changes, expected) => {
  expect(
    validateStay({
      from: "2027-06-10",
      to: "2027-06-12",
      today: "2027-06-01",
      guests: 2,
      maxGuests: 4,
      periods: [],
      ...changes,
    }),
  ).toBe(expected);
});

test("guest counts must be whole numbers within known capacity", () => {
  for (const guests of ["", 0, -1, 1.5, 5, NaN, "2"])
    expect(guestCountError(guests, 4)).toBe(messages.guestCountRange(1, 4));
  for (const guests of [1, 4]) expect(guestCountError(guests, 4)).toBe("");
  expect(guestCountError(0, 100, 0)).toBe("");
  for (const capacity of [0, -1, undefined, 2.5])
    expect(guestCountError(1, capacity)).toBe(messages.invalidStayGuests);
});
