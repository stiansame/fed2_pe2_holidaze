import CollapsibleSection from "./CollapsibleSection.jsx";
import Icon from "../Icon.jsx";

/**
 * Displays collapsible three-column mobile statistics and an always-visible desktop grid.
 * @param {object} props Component props.
 * @param {Array} props.items Statistic entries: label, value, icon and optional accent flag.
 * @returns {import('react').ReactNode}
 */
export default function AccountStats({ items }) {
  return (
    <CollapsibleSection title="Account summary" icon="chart" mobileHeadingOnly className="min-w-0 lg:h-full">
      <dl
        aria-label="Account statistics"
        className={`grid grid-cols-3 gap-2 lg:h-full lg:auto-rows-fr lg:gap-3 ${items.length > 5 ? "lg:grid-cols-3" : "lg:grid-cols-2"}`}
      >
        {items.map(([label, value, icon, accent], index) => (
          <div
            key={label}
            className={`relative grid min-h-20 min-w-0 grid-cols-[auto_minmax(0,1fr)] content-start items-center gap-x-1.5 gap-y-1 rounded-lg p-2.5 lg:flex lg:min-h-32 lg:flex-col lg:items-start lg:justify-end lg:gap-2 lg:p-4 ${items.length === 5 && index === 4 ? "lg:col-span-2" : ""} ${accent ? "bg-accent text-text" : "bg-primary text-surface"}`}
          >
            <Icon
              name={icon}
              className="col-start-1 row-start-1 size-5 shrink-0 lg:absolute lg:top-3 lg:right-3 lg:size-7"
            />
            <dt className="col-span-2 row-start-2 min-w-0 text-[0.6875rem] leading-tight font-medium lg:order-2 lg:text-small">
              {label}
            </dt>
            <dd
              className={`col-start-2 row-start-1 min-w-0 font-bold tracking-tight lg:order-1 lg:pt-6 ${value === "Not rated yet" ? "text-[0.6875rem] leading-tight lg:text-lg" : "text-h3 leading-none lg:text-4xl xl:text-5xl"}`}
              aria-label={value == null ? "Unavailable" : undefined}
            >
              {value ?? "—"}
            </dd>
          </div>
        ))}
      </dl>
    </CollapsibleSection>
  );
}
