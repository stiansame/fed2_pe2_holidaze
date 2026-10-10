const API_BASE = 'https://v2.api.noroff.dev/';

export class ApiError extends Error {
  constructor(message, status = 0, errors = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

/**
 * Sends a JSON request to Noroff and preserves pagination metadata.
 * @param {string} path API path, e.g. 'holidaze/venues'.
 * @param {object} [options] Request settings.
 * @param {string} [options.method='GET'] HTTP method.
 * @param {object} [options.query={}] URL parameters, e.g. page, limit or q.
 * @param {object} [options.body] Data to serialize as JSON.
 * @param {string} [options.token] Access token from login.
 * @param {string} [options.apiKey] Defaults to VITE_NOROFF_API_KEY.
 * @param {AbortSignal} [options.signal] Allows the caller to cancel the request.
 * @returns {Promise<object|null>} Full { data, meta } response, or null for 204.
 * @throws {ApiError} API, network or unreadable-response errors; status 0 means a network failure.
 */
export async function apiRequest(path, {
  method = 'GET',
  query = {},
  body,
  token,
  apiKey = import.meta.env?.VITE_NOROFF_API_KEY,
  signal,
} = {}) {
  const url = new URL(path.replace(/^\/+/, ''), API_BASE);
  if (url.origin !== new URL(API_BASE).origin) {
    throw new TypeError('API requests must use the Noroff API.');
  }
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, value);
  }

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  if (apiKey) headers['X-Noroff-API-Key'] = apiKey;

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    // Cancellation is intentional; callers can ignore it instead of showing an API error.
    if (signal?.aborted || error.name === 'AbortError') throw error;
    throw new ApiError('Unable to connect. Please try again.');
  }

  // Successful deletions have no JSON body to parse.
  if (response.status === 204) return null;
  let result;
  try {
    result = await response.json();
  } catch (error) {
    if (signal?.aborted || error.name === 'AbortError') throw error;
    throw new ApiError('The server returned an unreadable response.', response.status);
  }
  // fetch resolves even for HTTP errors such as 400 or 401.
  if (!response.ok) {
    const errors = result?.errors ?? [];
    throw new ApiError(
      errors.map(error => error.message).join('\n') || 'Request failed. Please try again.',
      response.status,
      errors,
    );
  }
  return result;
}
