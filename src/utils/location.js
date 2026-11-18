// Leaflet's Web Mercator limit, rounded to the form's six decimal places.
export const MAX_MAP_LATITUDE = 85.051129;

/**
 * Reads a complete map position; zero/zero is the API's missing-location default.
 * @param {string|number|null|undefined} lat Latitude.
 * @param {string|number|null|undefined} lng Longitude.
 * @returns {[number, number]|null}
 */
export function venueCoordinates(lat, lng) {
  if (!String(lat ?? "").trim() || !String(lng ?? "").trim()) return null;
  const point = [Number(lat), Number(lng)];
  return point.every(Number.isFinite) &&
    Math.abs(point[0]) <= MAX_MAP_LATITUDE &&
    Math.abs(point[1]) <= 180 &&
    (point[0] !== 0 || point[1] !== 0)
    ? point
    : null;
}
