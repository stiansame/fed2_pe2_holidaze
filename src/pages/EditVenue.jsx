import DocumentTitle from '../components/DocumentTitle.jsx';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { getOwnVenue, updateVenue } from '../api/venues.js';
import Loading from '../components/Loading.jsx';
import VenueForm from '../components/venues/VenueForm.jsx';
import BackLink from '../components/BackLink.jsx';
import { backDestination } from '../utils/navigation.js';

export default function EditVenue() {
  const { id } = useParams();
  return <VenueEditor key={id} id={id} />;
}

function VenueEditor({ id }) {
  const location = useLocation();
  const back = backDestination(location.state, '/manager/venues', 'Back to my venues');
  const { user, request } = useAuth();
  const navigate = useNavigate();
  const [venue, setVenue] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const active = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    active.current = true;
    getOwnVenue(request, id, user.name, { signal: controller.signal }).then(data => {
      if (!controller.signal.aborted) setVenue(data);
    }).catch(error => { if (!controller.signal.aborted) setError(error.message); });
    return () => { active.current = false; controller.abort(); };
  }, [id, request, user.name, attempt]);

  return <section className="min-w-0 space-y-5">
    <DocumentTitle>Holidaze | Edit venue</DocumentTitle>
    <h1 className="text-h3 font-bold sm:text-h2">Edit venue</h1>
    {error ? <div role="alert" className="space-y-3">
      <p className="text-danger">{error}</p>
      <button type="button" className="navigation-link" onClick={() => { setError(''); setAttempt(value => value + 1); }}>Try again</button>
      <BackLink to="/manager/venues" label="Back to my venues" />
    </div> : venue ? <VenueForm venue={venue} onCancel={() => navigate(back.to, { state: location.state?.backState })} onSave={async form => {
      const updated = await updateVenue(request, id, user.name, form);
      if (active.current) navigate(`/venues/${encodeURIComponent(updated.id)}`, { replace: true, state: location.state?.backState });
    }} /> : <Loading>Loading your venue…</Loading>}
  </section>;
}
