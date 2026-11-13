/** Shared venue rating badge, including theme styling and an unrated fallback. */
export default function Rating({ rating, className = '' }) {
  return <span className={`shrink-0 rounded-full bg-surface px-2.5 py-1.5 text-caption font-semibold text-primary ${className}`}>
    {rating > 0 ? <><span aria-hidden="true" className="rating-star">★ </span><span className="sr-only">Rating: </span>{rating}</> : 'New'}
  </span>;
}
