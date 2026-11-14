export const SESSION_KEY = 'holidaze-session';

/**
 * Reads JWT expiry without verifying the signature; the API remains the authority.
 * @param {object} user Session containing an access token.
 * @returns {number} Expiry in milliseconds, Infinity without exp, or zero for invalid data.
 */
export function sessionExpiresAt(user) {
  try {
    const payload = user.accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(payload));
    if (!claims || typeof claims !== 'object' || Array.isArray(claims)) return 0;
    // JWT expiry is optional. Without exp, the API decides when the token is rejected.
    if (!('exp' in claims)) return Infinity;
    return Number.isFinite(claims.exp) ? claims.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

/**
 * Restores a correctly shaped, unexpired session from browser storage.
 * @param {Storage} storage Storage containing the saved session.
 * @returns {object|null}
 */
export function readSession(storage) {
  try {
    const user = JSON.parse(storage.getItem(SESSION_KEY));
    return user && typeof user.name === 'string' && typeof user.venueManager === 'boolean'
      && sessionExpiresAt(user) > Date.now() ? user : null;
  } catch {
    return null;
  }
}
