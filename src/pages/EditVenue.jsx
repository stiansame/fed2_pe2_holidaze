import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';
import { getOwnVenue, updateVenue } from '../api/venues.js';
import Loading from '../components/Loading.jsx';
import VenueForm from '../components/venues/VenueForm.jsx';

export default function EditVenue() {
  const { id } = useParams();
  return <VenueEditor key={id} id={id} />;
}

function VenueEditor({ id }) {
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
    <title>Holidaze | Edit venue</title>
    <h1 className="text-h3 font-bold sm:text-h2">Edit venue</h1>
    {error ? <div role="alert" className="space-y-3">
      <p className="text-danger">{error}</p>
      <button type="button" className="navigation-link" onClick={() => { setError(''); setAttempt(value => value + 1); }}>Try again</button>
      <Link to="/manager/venues" className="navigation-link">Back to my venues</Link>
    </div> : venue ? <VenueForm venue={venue} onCancel={() => navigate('/manager/venues')} onSave={async form => {
      const updated = await updateVenue(request, id, user.name, form);
      if (active.current) navigate(`/venues/${encodeURIComponent(updated.id)}`, { replace: true });
    }} /> : <Loading>Loading your venue…</Loading>}
  </section>;
}
