const API_BASE = 'https://v2.api.noroff.dev/';

export class ApiError extends Error {
  constructor(message, status = 0, errors = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

// Returns the full { data, meta } response so callers can use pagination.
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
    if (signal?.aborted || error.name === 'AbortError') throw error;
    throw new ApiError('Unable to connect. Please try again.');
  }

  if (response.status === 204) return null;
  let result;
  try {
    result = await response.json();
  } catch (error) {
    if (signal?.aborted || error.name === 'AbortError') throw error;
    throw new ApiError('The server returned an unreadable response.', response.status);
  }
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
