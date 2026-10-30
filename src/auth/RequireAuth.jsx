import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.js';

export default function RequireAuth({ manager = false }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  if (manager && !user.venueManager) return <Navigate to="/profile" replace />;
  return <Outlet />;
}
