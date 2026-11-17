import { messages } from "../constants/messages.js";

const API_BASE = "https://v2.api.noroff.dev/";

/**
 * Checks whether a failed create request may already have saved the record.
 * @param {number} [status] HTTP status attached to the error, or zero without a response.
 * @returns {boolean} Whether retrying could create a duplicate.
 */
export function isCreateOutcomeUncertain(status) {
  return !status || status >= 500 || (status >= 200 && status < 300);
}

/**
 * Loads complete pages of 100 records and keeps the latest record for each ID.
 * @param {Function} request Request function supplied by the API client or account provider.
 * @param {string} path Noroff collection path.
 * @param {object} [options={}] Pagination settings.
 * @param {object} [options.query={}] Additional URL parameters.
 * @param {AbortSignal} [options.signal] Cancels the complete load.
 * @returns {Promise<object[]>}
 * @throws {Error} If any page fails or the load is cancelled.
 */
export async function getAllPages(request, path, { query = {}, signal } = {}) {
  const items = new Map();
  let page = 1;
  do {
    signal?.throwIfAborted();
    const { data, meta } = await request(path, {
      query: { ...query, page, limit: 100 },
      signal,
    });
    for (const item of data) items.set(item.id, item);
    page = meta?.nextPage;
  } while (page);
  signal?.throwIfAborted();
  return [...items.values()];
}

export class ApiError extends Error {
  /**
   * Keeps an API error message, HTTP status and field errors together.
   * @param {string} message User-facing error detail.
   * @param {number} [status=0] HTTP status, or zero without a response.
   * @param {object[]} [errors=[]] Field errors returned by Noroff.
   */
  constructor(message, status = 0, errors = []) {
    super(message);
    this.name = "ApiError";
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
 * @throws {TypeError} If the request targets a different origin.
 * @throws {Error} If the request is cancelled; the abort reason is preserved.
 */
export async function apiRequest(
  path,
  {
    method = "GET",
    query = {},
    body,
    token,
    apiKey = import.meta.env?.VITE_NOROFF_API_KEY,
    signal,
  } = {},
) {
  const url = new URL(path.replace(/^\/+/, ""), API_BASE);
  if (url.origin !== new URL(API_BASE).origin) {
    throw new TypeError(messages.invalidApiOrigin);
  }
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, value);
  }

  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  if (apiKey) headers["X-Noroff-API-Key"] = apiKey;

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
    if (signal?.aborted || error.name === "AbortError") throw error;
    throw new ApiError(messages.networkError);
  }

  // Successful deletions have no JSON body to parse.
  if (response.status === 204) return null;
  let result;
  try {
    result = await response.json();
  } catch (error) {
    if (signal?.aborted || error.name === "AbortError") throw error;
    throw new ApiError(messages.unreadableResponse, response.status);
  }
  // fetch resolves even for HTTP errors such as 400 or 401.
  if (!response.ok) {
    const errors = result?.errors ?? [];
    throw new ApiError(
      errors.map((error) => error.message).join("\n") || messages.requestFailed,
      response.status,
      errors,
    );
  }
  return result;
}
