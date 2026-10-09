import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <>
      <p className="mb-4 font-semibold text-muted">404</p>
      <h1 className="text-h2 font-bold">Page not found</h1>
      <p className="mt-4 text-muted">We couldn’t find the page you’re looking for.</p>
      <Link
        to="/"
        className="mt-8 inline-flex min-h-12 items-center rounded-lg bg-primary px-4 text-small font-semibold text-surface hover:bg-primary-hover"
      >
        Back to home
      </Link>
    </>
  );
}
