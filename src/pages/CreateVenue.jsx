import DocumentTitle from "../components/DocumentTitle.jsx";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.js";
import { createVenue } from "../api/venues.js";
import VenueForm from "../components/venues/VenueForm.jsx";

/**
 * Connects the shared venue form to creation and navigates only while still mounted.
 * @returns {import('react').ReactNode}
 */
export default function CreateVenue() {
  const { request } = useAuth();
  const navigate = useNavigate();
  const active = useRef(true);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  return (
    <section className="min-w-0 space-y-5">
      <DocumentTitle>Create venue | Holidaze</DocumentTitle>
      <h1 className="text-h3 font-bold sm:text-h2">Create venue</h1>
      <VenueForm
        onCancel={() => navigate(-1)}
        onSave={async (form) => {
          const venue = await createVenue(request, form);
          if (active.current)
            navigate(`/venues/${encodeURIComponent(venue.id)}`, {
              replace: true,
            });
        }}
      />
    </section>
  );
}
