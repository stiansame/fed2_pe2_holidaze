import { messages } from "../constants/messages.js";

export function venueCoordinates(lat, lng) {
  if (!String(lat ?? "").trim() || !String(lng ?? "").trim()) return null;
  const point = [Number(lat), Number(lng)];
  return point.every(Number.isFinite) &&
    Math.abs(point[0]) <= 90 &&
    Math.abs(point[1]) <= 180
    ? point
    : null;
}

export function venueFormData(form) {
  const text = (name) => String(form.get(name) ?? "").trim();
  const name = text("name");
  const description = text("description");
  const price = Number(text("price"));
  const maxGuests = Number(text("maxGuests"));
  const rating = Number(text("rating"));
  if (!name || !description) throw new Error(messages.requiredVenueDetails);
  if (
    !text("price") ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isSafeInteger(Math.round(price * 100)) ||
    price !== Math.round(price * 100) / 100
  ) {
    throw new Error(messages.invalidVenuePrice);
  }
  if (!Number.isSafeInteger(maxGuests) || maxGuests < 1)
    throw new Error(messages.invalidVenueGuests);
  if (!Number.isFinite(rating) || rating < 0 || rating > 5)
    throw new Error(messages.invalidRating);

  const descriptions = form.getAll("mediaAlt");
  const media = form
    .getAll("mediaUrl")
    .map((value, index) => {
      const url = value.trim();
      const alt = String(descriptions[index] ?? "").trim();
      if (!url && !alt) return null;
      if (!validMediaUrl(url)) {
        throw new Error(messages.invalidImageUrl(index + 1));
      }
      if (alt.length > 120)
        throw new Error(messages.imageAltTooLong(index + 1));
      return { url, alt };
    })
    .filter(Boolean);

  const location = {};
  for (const key of ["address", "city", "zip", "country", "continent"]) {
    if (text(key)) location[key] = text(key);
  }
  const lat = text("lat");
  const lng = text("lng");
  if (lat || lng) {
    const point = venueCoordinates(lat, lng);
    if (!point) {
      throw new Error(messages.invalidCoordinates);
    }
    [location.lat, location.lng] = point;
  }
  return {
    name,
    description,
    price,
    maxGuests,
    rating,
    media,
    meta: Object.fromEntries(
      ["wifi", "parking", "breakfast", "pets"].map((key) => [
        key,
        form.has(key),
      ]),
    ),
    ...(Object.keys(location).length && { location }),
  };
}
import { validMediaUrl } from "./media.js";
