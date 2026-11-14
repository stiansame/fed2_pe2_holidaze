import DocumentTitle from '../components/DocumentTitle.jsx';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { createVenue } from '../api/venues.js';
import VenueForm from '../components/venues/VenueForm.jsx';
import { backDestination } from '../utils/navigation.js';

export default function CreateVenue() {
  const location = useLocation();
  const back = backDestination(location.state, '/manager/venues', 'Back to my venues');
  const { request } = useAuth();
  const navigate = useNavigate();
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => { active.current = false; };
  }, []);
  return <section className="min-w-0 space-y-5">
    <DocumentTitle>Holidaze | Create venue</DocumentTitle>
    <h1 className="text-h3 font-bold sm:text-h2">Create venue</h1>
    <VenueForm onCancel={() => navigate(back.to, { state: location.state?.backState })} onSave={async form => {
      const venue = await createVenue(request, form);
      if (active.current) navigate(`/venues/${encodeURIComponent(venue.id)}`, { replace: true, state: location.state });
    }} />
  </section>;
}
