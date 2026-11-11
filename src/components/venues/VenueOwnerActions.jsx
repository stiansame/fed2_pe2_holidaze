import { Link, useLocation } from 'react-router-dom';
import Icon from '../Icon.jsx';
import DeleteVenue from './DeleteVenue.jsx';
import EditMenu from '../EditMenu.jsx';
import { navigationOrigin } from '../../utils/navigation.js';

export default function VenueOwnerActions({ venue, card = false, onDeleted }) {
  const location = useLocation();
  return <EditMenu label="Manage your venue" above>
    <Link to={`/manager/venues/${encodeURIComponent(venue.id)}/edit`} state={navigationOrigin(location)} className="edit-menu-item"><Icon name="edit" />Edit venue</Link>
    <DeleteVenue venue={venue} onDeleted={onDeleted} />
    {card && <Link to={`/manager/bookings?venue=${encodeURIComponent(venue.id)}`} state={navigationOrigin(location)} className="edit-menu-item"><Icon name="calendar" />Bookings</Link>}
  </EditMenu>;
}
