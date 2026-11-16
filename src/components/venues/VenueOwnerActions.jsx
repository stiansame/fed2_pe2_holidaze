import { Link } from "react-router-dom";
import Icon from "../Icon.jsx";
import DeleteVenue from "./DeleteVenue.jsx";
import EditMenu from "../EditMenu.jsx";

/**
 * Groups owner edit/delete actions and optional booking navigation in the shared menu.
 * @param {object} props Component props.
 * @param {object} props.venue Venue data.
 * @param {boolean} [props.card] Includes booking navigation for an owned venue card.
 * @param {Function} [props.onDeleted] Receives the deleted venue ID; otherwise deletion returns to My venues.
 * @returns {import('react').ReactNode}
 */
export default function VenueOwnerActions({ venue, card = false, onDeleted }) {
  return (
    <EditMenu label="Manage your venue" above>
      <Link
        to={`/manager/venues/${encodeURIComponent(venue.id)}/edit`}
        className="edit-menu-item"
      >
        <Icon name="edit" />
        Edit venue
      </Link>
      <DeleteVenue venue={venue} onDeleted={onDeleted} />
      {card && (
        <Link
          to={`/manager/bookings?venue=${encodeURIComponent(venue.id)}`}
          className="edit-menu-item"
        >
          <Icon name="calendar" />
          Bookings
        </Link>
      )}
    </EditMenu>
  );
}
