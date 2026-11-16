import { useNavigate } from "react-router-dom";
import Icon from "./Icon.jsx";

/**
 * Returns one step in browser history, without a fallback destination.
 * @param {object} props Component props.
 * @param {boolean} [props.iconOnly] Shows only the arrow with an accessible label.
 * @returns {import('react').ReactNode}
 */
export default function BackLink({ iconOnly = false }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      aria-label="Go back"
      title="Go back"
      className={
        iconOnly
          ? "navigation-link size-11 shrink-0 justify-center p-0"
          : "navigation-link"
      }
    >
      {iconOnly ? <Icon name="left" /> : "← Back"}
    </button>
  );
}
