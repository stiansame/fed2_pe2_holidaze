import { Link } from "react-router-dom";
import Icon from "../Icon.jsx";

/**
 * Combines a section title, count badge and optional navigation or expansion action.
 * @param {object} props Component props.
 * @param {string} props.title Section title used for visible and accessible labels.
 * @param {number} props.count Total number of section items.
 * @param {string} props.id Heading ID used to label its section.
 * @param {string} props.to Navigation destination.
 * @param {boolean} props.expanded Whether all items are currently visible.
 * @param {Function} props.onToggle Toggles the expanded list.
 * @param {string} [props.icon] Optional mobile disclosure icon.
 * @param {boolean} [props.collapsed] Mobile content is hidden.
 * @param {string} [props.contentId] ID of the controlled content.
 * @param {Function} [props.onCollapse] Toggles mobile content independently of Show all.
 * @param {string} [props.level] Heading element to render.
 * @param {import('react').ReactNode} props.children Content supplied by the parent.
 * @returns {import('react').ReactNode}
 */
export default function SectionHeading({
  title,
  count,
  id,
  to,
  expanded,
  onToggle,
  level = "h2",
  children,
  icon,
  collapsed,
  contentId,
  onCollapse,
}) {
  const Heading = level;
  const actionClass =
    "ml-auto inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-text hover:bg-tint";
  const chevron = (
    <Icon
      name="right"
      className={`size-8 stroke-[2.5] transition-transform motion-reduce:transition-none ${expanded ? "rotate-90" : ""}`}
    />
  );
  const titleContent = (
    <span className="relative block min-w-0 max-w-full pr-4">
      <span className="block truncate">{title}</span>
      {count != null && (
        <span className="absolute -top-1 right-0 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[0.625rem] leading-none font-semibold text-surface">
          <span className="sr-only">Total: </span>
          {count}
        </span>
      )}
    </span>
  );
  return (
    <div
      className={`account-section-heading flex min-w-0 items-center gap-3 text-h3 font-bold ${level === "h1" ? "sm:text-h2" : ""}`}
    >
      <Heading
        id={id}
        title={title}
        className={`min-w-0 text-[1em] font-bold ${onCollapse ? "flex-1" : ""}`}
      >
        {onCollapse ? (
          <>
            <button
              type="button"
              aria-label={title}
              aria-expanded={!collapsed}
              aria-controls={contentId}
              onClick={onCollapse}
              className={`flex min-h-11 w-full min-w-0 items-center gap-2 rounded-lg text-left text-body text-text hover:bg-tint lg:hidden ${icon ? "border border-border bg-surface px-3" : ""}`}
            >
              <Icon
                name={icon || "right"}
                className={`size-5 shrink-0 ${icon ? "" : collapsed ? "rotate-90" : "-rotate-90"}`}
              />
              {titleContent}
              {icon && (
                <Icon
                  name="right"
                  className={`ml-auto size-5 shrink-0 ${collapsed ? "rotate-90" : "-rotate-90"}`}
                />
              )}
            </button>
            <span className="hidden lg:block">{titleContent}</span>
          </>
        ) : (
          titleContent
        )}
      </Heading>
      {children}
      {to ? (
        <Link
          to={to}
          aria-label={`View all ${title.toLowerCase()}`}
          className="navigation-link ml-auto shrink-0 text-small"
        >
          Show all
        </Link>
      ) : (
        onToggle && (
          <button
            type="button"
            aria-label={`${expanded ? "Show fewer" : "Show all"} ${title.toLowerCase()}`}
            aria-expanded={expanded}
            onClick={onToggle}
            className={actionClass}
          >
            {chevron}
          </button>
        )
      )}
    </div>
  );
}
