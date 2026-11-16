import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext.js";

/**
 * Redirects guests to login and restricts manager routes to hosting accounts.
 * @param {object} props Component props.
 * @param {boolean} [props.manager] Requires a venue-manager account.
 * @returns {import('react').ReactNode}
 */
export default function RequireAuth({ manager = false }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user)
    return (
      <Navigate
        to="/login"
        state={{
          from: location.pathname + location.search,
        }}
        replace
      />
    );
  if (manager && !user.venueManager) return <Navigate to="/profile" replace />;
  return <Outlet />;
}
