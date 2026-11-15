/**
 * Displays a labelled rating badge or New when no positive rating is available.
 * @param {object} props Component props.
 * @param {number} [props.rating] Venue rating; missing values display New.
 * @param {string} [props.className] Additional styling classes.
 * @returns {import('react').ReactNode}
 */
export default function Rating({ rating, className = "" }) {
  return (
    <span
      className={`shrink-0 rounded-full bg-surface px-2.5 py-1.5 text-caption font-semibold text-primary ${className}`}
    >
      {rating > 0 ? (
        <>
          <span aria-hidden="true" className="rating-star">
            ★{" "}
          </span>
          <span className="sr-only">Rating: </span>
          {rating}
        </>
      ) : (
        "New"
      )}
    </span>
  );
}
