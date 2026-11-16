import { useId, useState } from "react";
import SectionHeading from "./SectionHeading.jsx";

/**
 * Toggles mobile section content independently while keeping desktop content visible.
 * @param {object} props Section heading and content.
 * @param {string} props.title Visible title.
 * @param {number} [props.count] Total items.
 * @param {string} [props.to] Separate full-list destination.
 * @param {string} [props.icon] Heading icon.
 * @param {boolean} [props.mobileHeadingOnly=false] Hides the summary heading on desktop.
 * @param {string} [props.className="account-section"] Section styling.
 * @param {import('react').ReactNode} props.children Content retained while collapsed.
 * @returns {import('react').ReactNode}
 */
export default function CollapsibleSection({
  title,
  count,
  to,
  icon,
  mobileHeadingOnly = false,
  className = "account-section",
  children,
}) {
  const [expanded, setExpanded] = useState(true);
  const id = useId();
  const headingId = `${title.toLowerCase().replaceAll(" ", "-")}-heading-${id}`;
  const contentId = `${headingId}-content`;
  return (
    <section className={className} aria-labelledby={headingId}>
      <div className={mobileHeadingOnly ? "mb-3 lg:hidden" : ""}>
        <SectionHeading
          id={headingId}
          title={title}
          count={count}
          to={to}
          icon={icon}
          collapsed={!expanded}
          contentId={contentId}
          onCollapse={() => setExpanded((value) => !value)}
        />
      </div>
      <div
        id={contentId}
        className={`${expanded ? "" : "hidden lg:block"} lg:h-full`}
      >
        {children}
      </div>
    </section>
  );
}
