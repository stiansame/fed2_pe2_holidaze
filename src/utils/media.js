/**
 * Validates a complete HTTP(S) URL without embedded credentials.
 * @param {string} url Media URL, limited to 300 characters.
 * @returns {boolean}
 */
export function validMediaUrl(url) {
  try {
    const parsed = new URL(url);
    return (
      ["http:", "https:"].includes(parsed.protocol) &&
      !parsed.username &&
      !parsed.password &&
      url.length <= 300
    );
  } catch {
    return false;
  }
}
