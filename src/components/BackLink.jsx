import { Link, useLocation } from 'react-router-dom';
import { backDestination } from '../utils/navigation.js';
import Icon from './Icon.jsx';

export default function BackLink({ to = '/venues', label = 'Back to venues', iconOnly = false, shortLabel = false }) {
  const { state } = useLocation();
  const destination = backDestination(state, to, label);
  const text = shortLabel ? destination.label.replace(/^Back to (.)/, (_, first) => first.toUpperCase()) : destination.label;
  return <Link to={destination.to} state={state?.backState} replace aria-label={iconOnly ? destination.label : undefined} title={iconOnly ? destination.label : undefined} className={iconOnly ? 'navigation-link size-11 shrink-0 justify-center p-0' : `navigation-link${shortLabel ? ' text-small' : ''}`}>{iconOnly ? <Icon name="left" /> : `← ${text}`}</Link>;
}
