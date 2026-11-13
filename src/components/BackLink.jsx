import { Link, useLocation } from 'react-router-dom';
import { backDestination } from '../utils/navigation.js';
import Icon from './Icon.jsx';

export default function BackLink({ to = '/venues', label = 'Back to venues', iconOnly = false }) {
  const { state } = useLocation();
  const destination = backDestination(state, to, label);
  return <Link to={destination.to} state={state?.backState} replace aria-label={iconOnly ? destination.label : undefined} title={iconOnly ? destination.label : undefined} className={iconOnly ? 'navigation-link size-11 shrink-0 justify-center p-0' : 'navigation-link'}>{iconOnly ? <Icon name="left" /> : `← ${destination.label}`}</Link>;
}
