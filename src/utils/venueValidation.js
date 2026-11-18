import { messages } from "../constants/messages.js";
import { validMediaUrl } from "./media.js";
import { venueCoordinates } from "./location.js";
import * as z from "zod/mini";

const venueSchema = z
  .object({
    name: z.string().check(z.minLength(1, messages.requiredVenueDetails)),
    description: z
      .string()
      .check(z.minLength(1, messages.requiredVenueDetails)),
    price: z.pipe(
      z.string().check(z.minLength(1, messages.invalidVenuePrice)),
      z.coerce
        .number({ error: messages.invalidVenuePrice })
        .check(
          z.refine(
            (value) =>
              value >= 0 &&
              Number.isSafeInteger(Math.round(value * 100)) &&
              value === Math.round(value * 100) / 100,
            messages.invalidVenuePrice,
          ),
        ),
    ),
    maxGuests: z.coerce
      .number({ error: messages.invalidVenueGuests })
      .check(
        z.refine(
          (value) => Number.isSafeInteger(value) && value >= 1,
          messages.invalidVenueGuests,
        ),
      ),
    rating: z.coerce
      .number({ error: messages.invalidRating })
      .check(
        z.refine((value) => value >= 0 && value <= 5, messages.invalidRating),
      ),
    // Keep blank rows until parsing so issue paths match the visible photo rows.
    media: z.array(
      z
        .object({
          url: z.string(),
          // Match HTML maxlength's UTF-16 units, including emoji.
          alt: z.string().check(
            z.refine((value) => value.length <= 120, {
              error: ({ path }) => messages.imageAltTooLong(path[1] + 1),
            }),
          ),
        })
        .check(
          z.refine(
            (photo) => (!photo.url && !photo.alt) || validMediaUrl(photo.url),
            {
              path: ["url"],
              error: ({ path }) => messages.invalidImageUrl(path[1] + 1),
            },
          ),
        ),
    ),
    lat: z.string(),
    lng: z.string(),
  })
  .check(({ value: { lat, lng }, issues }) => {
    if (!(lat || lng) || venueCoordinates(lat, lng)) return;
    for (const field of ["lat", "lng"]) {
      issues.push({
        code: "custom",
        path: [field],
        input: field === "lat" ? lat : lng,
        message: messages.invalidCoordinates,
      });
    }
  });

/**
 * Builds a validated venue payload from the shared creation/editing form.
 * @param {FormData} form Venue fields, media rows, amenities and optional location.
 * @returns {object}
 * @throws {import('zod/v4/core').$ZodError} All field validation issues.
 */
export function venueFormData(form) {
  /**
   * Reads a trimmed field from the enclosing venue form.
   * @param {string} name Form field name.
   * @returns {string}
   */
  const text = (name) => String(form.get(name) ?? "").trim();
  const descriptions = form.getAll("mediaAlt");
  const { name, description, price, maxGuests, rating, media, lat, lng } =
    venueSchema.parse({
      name: text("name"),
      description: text("description"),
      price: text("price"),
      maxGuests: text("maxGuests"),
      rating: text("rating"),
      lat: text("lat"),
      lng: text("lng"),
      media: form.getAll("mediaUrl").map((url, index) => ({
        url: String(url).trim(),
        alt: String(descriptions[index] ?? "").trim(),
      })),
    });

  const location = {};
  for (const key of ["address", "city", "zip", "country", "continent"]) {
    if (text(key)) location[key] = text(key);
  }
  if (lat || lng) {
    [location.lat, location.lng] = venueCoordinates(lat, lng);
  }
  return {
    name,
    description,
    price,
    maxGuests,
    rating,
    media: media.filter((photo) => photo.url || photo.alt),
    meta: Object.fromEntries(
      ["wifi", "parking", "breakfast", "pets"].map((key) => [
        key,
        form.has(key),
      ]),
    ),
    ...(Object.keys(location).length && { location }),
  };
}
