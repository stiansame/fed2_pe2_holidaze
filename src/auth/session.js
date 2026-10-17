export const SESSION_KEY = 'holidaze-session';

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

export function readSession(storage) {
  try {
    const user = JSON.parse(storage.getItem(SESSION_KEY));
    return user && typeof user.name === 'string' && typeof user.venueManager === 'boolean'
      && sessionExpiresAt(user) > Date.now() ? user : null;
  } catch {
    return null;
  }
}
