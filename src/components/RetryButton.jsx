/**
 * Retries a failed load using the page's own recovery action.
 * @param {object} props Component props.
 * @param {Function} props.onRetry Restarts the request.
 * @param {string} [props.className] Button style for this page.
 * @returns {import('react').ReactNode}
 */
export default function RetryButton({
  onRetry,
  className = "navigation-link",
}) {
  return (
    <button type="button" className={className} onClick={onRetry}>
      Try again
    </button>
  );
}
