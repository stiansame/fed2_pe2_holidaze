/**
 * Renders a selectable amenity pill for search filters and venue forms.
 * @param {object} props Component props.
 * @param {object} props.item Shared amenity key, label and icon.
 * @param {boolean} props.selected Whether the amenity is active.
 * @param {Function} props.onClick Toggles the selected amenity.
 * @returns {import('react').ReactNode}
 */
export default function AmenityPill({ item, selected, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`pill amenity-pill ${selected ? "border-primary bg-primary text-surface" : "border-border bg-surface text-text hover:bg-tint"}`}
    >
      <img
        src={item.icon}
        alt=""
        width="18"
        height="18"
        className={selected ? "brightness-0 invert" : ""}
      />
      {item.label}
    </button>
  );
}
