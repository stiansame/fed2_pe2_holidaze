/**
 * Records the current route and its preceding navigation state for return links.
 * @param {object} location Router location.
 * @param {string} location.pathname Current route path.
 * @param {string} [location.search=""] Current query string.
 * @param {*} [location.state] State carried from the preceding route.
 * @returns {{backTo: string, backState: *}}
 */
export function navigationOrigin({ pathname, search = "", state }) {
  return { backTo: pathname + search, backState: state };
}

/**
 * Resolves a supported internal return link, falling back for unsafe or unknown destinations.
 * @param {object} [state] Router state containing backTo.
 * @param {string} [to="/venues"] Fallback destination.
 * @param {string} [label="Back to venues"] Fallback link label.
 * @returns {{to: string, label: string}}
 */
export function backDestination(
  state,
  to = "/venues",
  label = "Back to venues",
) {
  const target = state?.backTo;
  if (
    typeof target !== "string" ||
    !target.startsWith("/") ||
    target.startsWith("//") ||
    target.includes("\\")
  )
    return { to, label };
  const path = target.split("?")[0];
  const names = {
    "/": "home",
    "/venues": "venues",
    "/profile": "my account",
    "/bookings": "my stays",
    "/manager/venues": "my venues",
    "/manager/bookings": "venue bookings",
    "/manager/venues/new": "create venue",
  };
  const name =
    names[path] ||
    (/^\/manager\/bookings\/[^/]+$/.test(path)
      ? "booking details"
      : /^\/venues\/[^/]+$/.test(path)
        ? "venue"
        : /^\/profiles\/[^/]+$/.test(path)
          ? "profile"
          : null);
  return name ? { to: target, label: `Back to ${name}` } : { to, label };
}
