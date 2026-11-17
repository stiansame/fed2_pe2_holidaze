import RetryButton from "../components/RetryButton.jsx";
import DocumentTitle from "../components/DocumentTitle.jsx";
import { useCallback, useEffect, useRef } from "react";
import useAsync from "../hooks/useAsync.js";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.js";
import { getOwnVenue, updateVenue } from "../api/venues.js";
import Loading from "../components/Loading.jsx";
import VenueForm from "../components/venues/VenueForm.jsx";
import BackLink from "../components/BackLink.jsx";

/**
 * Resets the venue editor when the route ID changes.
 * @returns {import('react').ReactNode}
 */
export default function EditVenue() {
  const { id } = useParams();
  return <VenueEditor key={id} id={id} />;
}

/**
 * Loads an owned venue and connects the shared form to validated updates.
 * @param {object} props Component props.
 * @param {string} props.id Route record ID.
 * @returns {import('react').ReactNode}
 */
function VenueEditor({ id }) {
  const { user, request } = useAuth();
  const navigate = useNavigate();
  const load = useCallback(
    (signal) => getOwnVenue(request, id, user.name, { signal }),
    [request, id, user.name],
  );
  const { data: venue, error, retry } = useAsync(load);
  const active = useRef(false);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);

  return (
    <section className="min-w-0 space-y-5">
      <DocumentTitle>Holidaze | Edit venue</DocumentTitle>
      <h1 className="text-h3 font-bold sm:text-h2">Edit venue</h1>
      {error ? (
        <div role="alert" className="space-y-3">
          <p className="text-danger">{error.message}</p>
          <RetryButton onRetry={retry} />
          <BackLink />
        </div>
      ) : venue ? (
        <VenueForm
          venue={venue}
          onCancel={() => navigate(-1)}
          onSave={async (form) => {
            const updated = await updateVenue(request, id, user.name, form);
            if (active.current)
              navigate(`/venues/${encodeURIComponent(updated.id)}`, {
                replace: true,
              });
          }}
        />
      ) : (
        <Loading>Loading your venue…</Loading>
      )}
    </section>
  );
}
