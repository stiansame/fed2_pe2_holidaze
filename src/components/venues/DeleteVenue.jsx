import { useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.js';
import { deleteVenue } from '../../api/venues.js';
import Icon from '../Icon.jsx';

export default function DeleteVenue({ venue, onDeleted }) {
  const { user, request } = useAuth();
  const navigate = useNavigate();
  const dialog = useRef(null);
  const submitting = useRef(false);
  const titleId = useId();
  const descriptionId = useId();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function remove() {
    if (submitting.current) return;
    submitting.current = true;
    setPending(true);
    setError('');
    try {
      await deleteVenue(request, venue.id, user.name);
      if (!dialog.current) return;
      dialog.current.close();
      if (onDeleted) onDeleted(venue.id);
      else navigate('/manager/venues', { replace: true, state: { notice: 'Venue deleted.' } });
    } catch (error) {
      setError(`${error.message} Refresh My venues if the deletion outcome is unclear.`);
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  if (!user?.venueManager) return null;
  return <>
    <button type="button" aria-label={`Delete venue: ${venue.name}`} onClick={() => { setError(''); dialog.current.showModal(); }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-danger bg-surface px-4 font-semibold text-danger hover:bg-danger/10"><Icon name="trash" />Delete venue</button>
    <dialog ref={dialog} aria-labelledby={titleId} aria-describedby={descriptionId} onCancel={event => { if (submitting.current) event.preventDefault(); }} className="m-auto w-[calc(100%-2rem)] max-w-lg space-y-4 rounded-xl border border-border bg-surface p-5 text-text backdrop:bg-black/60 sm:p-6">
      <h2 id={titleId} className="text-h3 font-bold">Delete venue?</h2>
      <p id={descriptionId} className="wrap-anywhere">Delete “{venue.name?.trim() || 'Unnamed stay'}”? This permanently removes the venue and cannot be undone.</p>
      <div className="flex flex-wrap gap-3">
        <button type="button" autoFocus disabled={pending} onClick={() => dialog.current.close()} className="navigation-link disabled:opacity-60">Cancel</button>
        <button type="button" disabled={pending} onClick={remove} className="min-h-12 rounded-lg bg-danger px-4 font-semibold text-surface disabled:opacity-60">{pending ? 'Deleting…' : 'Confirm deletion'}</button>
      </div>
      {error && <p role="alert" className="whitespace-pre-line text-danger">{error}</p>}
    </dialog>
  </>;
}
