import CollapsibleSection from "../account/CollapsibleSection.jsx";
import { useId, useState } from "react";
import SectionHeading from "../account/SectionHeading.jsx";

/**
 * Shows three booking cards with shared heading, empty state and expansion controls.
 * @param {object} props Group content and display options.
 * @param {string} props.title Visible group heading.
 * @param {object[]} props.bookings Bookings to display.
 * @param {string} props.emptyMessage Text shown for an empty group.
 * @param {string} [props.allLink] Full-list destination for account previews.
 * @param {boolean} [props.initialExpanded=false] Initially shows every booking.
 * @param {Function} props.children Renders a keyed card for each visible booking.
 * @returns {import('react').ReactNode}
 */
export default function BookingGroup({
  title,
  bookings,
  emptyMessage,
  allLink,
  initialExpanded = false,
  children,
}) {
  const [expanded, setExpanded] = useState(initialExpanded && !allLink);
  const id = useId();
  const headingId = `${title.toLowerCase().replaceAll(" ", "-")}-heading-${id}`;
  const content = !bookings.length ? (
    <p className="empty-state text-muted">{emptyMessage}</p>
  ) : (
    <div className="card-grid">
      {(expanded ? bookings : bookings.slice(0, 3)).map(children)}
    </div>
  );
  if (allLink)
    return (
      <CollapsibleSection
        title={title}
        count={bookings.length}
        to={bookings.length > 3 ? allLink : undefined}
      >
        {content}
      </CollapsibleSection>
    );
  return (
    <section className="account-section" aria-labelledby={headingId}>
      <SectionHeading
        id={headingId}
        title={title}
        count={bookings.length}
        expanded={expanded}
        onToggle={
          bookings.length > 3 ? () => setExpanded((value) => !value) : undefined
        }
      />
      {content}
    </section>
  );
}
