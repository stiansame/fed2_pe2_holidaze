import { messages } from '../constants/messages.js';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl rounded-xl border border-border bg-surface p-6 sm:p-8">
      <title>{`Holidaze | ${messages.pageNotFound}`}</title>
      <p className="mb-4 font-semibold text-muted">404</p>
      <h1 className="text-h2 font-bold">{messages.pageNotFound}</h1>
      <p className="mt-4 text-muted">{messages.pageNotFoundDescription}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/venues" className="inline-flex min-h-12 items-center rounded-lg bg-primary px-4 font-semibold text-surface hover:bg-primary-hover">Explore venues</Link>
        <Link to="/" className="navigation-link">Back to home</Link>
      </div>
    </section>
  );
}
