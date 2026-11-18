/**
 * Compares nonempty account names without case or surrounding whitespace.
 * @param {string|null|undefined} a First account name.
 * @param {string|null|undefined} b Second account name.
 * @returns {boolean}
 */
export function sameName(a, b) {
  return (
    typeof a === "string" &&
    typeof b === "string" &&
    a.trim() !== "" &&
    a.trim().toLowerCase() === b.trim().toLowerCase()
  );
}
