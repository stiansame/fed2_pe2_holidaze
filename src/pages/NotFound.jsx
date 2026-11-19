import DocumentTitle from "../components/DocumentTitle.jsx";
import { messages } from "../constants/messages.js";
import { Link } from "react-router-dom";
import ErrorAnimation from "../components/ErrorAnimation.jsx";

/**
 * Shares the missing-page and missing-venue layout, artwork and navigation.
 * @param {object} props Component props.
 * @param {"page"|"venue"} [props.kind="page"] Selects the error message and artwork.
 * @returns {import('react').ReactNode}
 */
export default function NotFound({ kind = "page" }) {
  const messageKey = kind === "venue" ? "venueNotFound" : "pageNotFound";
  return (
    <section className="not-found empty-state mx-auto max-w-xl rounded-xl border border-border bg-surface p-6 sm:p-8">
      <DocumentTitle>{`Holidaze | ${messages[messageKey]}`}</DocumentTitle>
      <ErrorAnimation kind={kind} />
      <p className="mb-4 text-6xl leading-none font-bold text-primary">404</p>
      <h1 className="min-h-[3lh] whitespace-pre-line text-h3 font-bold max-[359px]:min-h-[4lh] sm:min-h-[2lh] sm:text-h2">
        {messages[`${messageKey}Heading`]}
      </h1>
      <p className="mt-4 min-h-[5lh] text-muted sm:min-h-[3lh]">
        {messages[`${messageKey}Description`]}
      </p>
      <div className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(min(100%,8.5rem),1fr))] gap-3">
        <Link
          to="/venues"
          className="primary-button inline-flex items-center justify-center px-2 text-small whitespace-nowrap sm:text-body"
        >
          Explore venues
        </Link>
        <Link
          to="/"
          className="navigation-link justify-center px-2 text-small whitespace-nowrap sm:text-body"
        >
          Back to home
        </Link>
      </div>
    </section>
  );
}
