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
    <section className="empty-state mx-auto max-w-xl rounded-xl border border-border bg-surface p-6 sm:p-8">
      <DocumentTitle>{`Holidaze | ${messages[messageKey]}`}</DocumentTitle>
      <ErrorAnimation kind={kind} />
      <p className="mb-4 text-6xl leading-none font-bold text-primary">404</p>
      <h1 className="whitespace-pre-line text-h3 font-bold sm:text-h2">
        {messages[`${messageKey}Heading`]}
      </h1>
      <p className="mt-4 text-muted">{messages[`${messageKey}Description`]}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/venues" className="primary-button inline-flex items-center">
          Explore venues
        </Link>
        <Link to="/" className="navigation-link">
          Back to home
        </Link>
      </div>
    </section>
  );
}
