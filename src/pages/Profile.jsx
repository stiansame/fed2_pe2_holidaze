import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.js';

export default function Profile() {
  const { user, becomeManager } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function enableManager() {
    if (pending) return;
    setPending(true);
    setError('');
    try {
      await becomeManager();
    } catch (error) {
      setError(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="max-w-xl space-y-5 rounded-lg border border-border bg-surface p-6 md:p-8">
      <h1 className="text-h2 font-bold">My profile</h1>
      <p className="font-semibold wrap-anywhere">{user.name}</p>
      <p className="text-muted wrap-anywhere">{user.email}</p>
      {user.venueManager ? <>
        <p role="status">You are registered as a venue manager.</p>
        <Link to="/manager" className="inline-flex min-h-12 items-center rounded-lg bg-primary px-4 font-semibold text-surface hover:bg-primary-hover">Go to manager dashboard</Link>
      </> : <>
        <p>Want to host guests? Become a venue manager to create and manage your own venues.</p>
        <button type="button" disabled={pending} onClick={enableManager} className="min-h-12 rounded-lg bg-primary px-4 font-semibold text-surface hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60">
          {pending ? 'Please wait…' : 'Become a venue manager'}
        </button>
      </>}
      {error && <p role="alert" className="whitespace-pre-line text-danger">{error}</p>}
    </section>
  );
}
