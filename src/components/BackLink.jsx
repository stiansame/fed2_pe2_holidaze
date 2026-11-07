import { Link, useLocation } from 'react-router-dom';
import { backDestination } from '../utils/navigation.js';

export default function BackLink({ to = '/venues', label = 'Back to venues' }) {
  const { state } = useLocation();
  const destination = backDestination(state, to, label);
  return <Link to={destination.to} state={state?.backState} replace className="navigation-link">← {destination.label}</Link>;
}
