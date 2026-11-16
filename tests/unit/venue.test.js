import { expect, test } from "vitest";
import {
  formatLocation,
  formatPrice,
  selectHighlyRatedVenues,
} from "../../src/utils/venue.js";

test("formats complete, partial and missing locations consistently", () => {
  expect(formatLocation({ city: " Oslo ", country: " Norway " })).toBe(
    "Oslo, Norway",
  );
  expect(formatLocation({ country: "Norway" })).toBe("Norway");
  expect(formatLocation()).toBe("Location not specified");
  expect(formatPrice(1500).replaceAll("\u00a0", " ")).toBe("NOK 1 500,-");
});

test("selects and shuffles only qualifying venues without changing the source", () => {
  const venue = {
    rating: 4.9,
    location: { lat: 60, lng: 10 },
    media: [
      { url: "https://example.com/a.jpg" },
      { url: "https://example.com/b.jpg" },
    ],
  };
  const first = { ...venue, id: "first" };
  const second = { ...venue, id: "second" };
  const source = [
    first,
    { ...venue, rating: 4.5 },
    { ...venue, location: { lat: 0, lng: 0 } },
    { ...venue, media: [venue.media[0], venue.media[0]] },
    { ...venue, media: [{ url: "broken" }, ...venue.media] },
    second,
  ];
  const original = structuredClone(source);
  expect(selectHighlyRatedVenues(source, () => 0)).toEqual([second, first]);
  expect(source).toEqual(original);
});
