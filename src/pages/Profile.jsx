import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../auth/AuthContext.js';
import HostAvatar from '../components/HostAvatar.jsx';
import VenueImage from '../components/venues/VenueImage.jsx';
import { profileUpdate } from '../utils/profile.js';

export default function Profile() {
  const { user, request, becomeManager } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const path = `holidaze/profiles/${encodeURIComponent(user.name)}`;

  useEffect(() => {
    const controller = new AbortController();
    request(path, { signal: controller.signal }).then(({ data }) => {
      if (!controller.signal.aborted) setProfile(data);
    }).catch(error => {
      if (!controller.signal.aborted) setError(error.message);
    });
    return () => controller.abort();
  }, [path, request, attempt]);

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
    <section className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-border bg-surface">
      <title>Holidaze | My profile</title>
      {profile && <VenueImage key={profile.banner?.url} media={profile.banner} name={`${user.name}'s banner`} className="h-40 sm:h-56" loading="eager" />}
      <div className={`space-y-5 px-5 pb-5 sm:px-8 sm:pb-8 ${profile ? '' : 'pt-5 sm:pt-8'}`}>
        <h1 className="sr-only">My profile</h1>
        {!profile && !error && <p role="status">Loading your profile…</p>}
        {profile && <>
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
            <HostAvatar key={profile.avatar?.url} media={profile.avatar} className="-mt-14 size-28 border-4 border-surface bg-surface sm:-mt-16 sm:size-32" />
            <div className="min-w-0 flex-1 sm:pt-3 sm:pl-4">
              <h2 className="text-h3 font-bold wrap-anywhere">{profile.name}</h2>
              <p className="text-small text-muted wrap-anywhere">{profile.email}</p>
              {user.venueManager && <span className="mt-2 inline-block rounded-full bg-tint px-3 py-1 text-caption font-semibold text-primary">Venue manager</span>}
            </div>
          </div>
          {editing ? <ProfileForm profile={profile} path={path} onCancel={() => setEditing(false)} onSave={data => { setProfile(data); setEditing(false); setSaved(true); }} /> : <>
            <p className="whitespace-pre-line text-muted wrap-anywhere">{profile.bio?.trim() || 'No bio yet.'}</p>
            {saved && <p role="status" className="text-success">Profile updated.</p>}
            <button type="button" disabled={pending} onClick={() => { setSaved(false); setError(''); setEditing(true); }} className="min-h-12 rounded-lg bg-primary px-4 font-semibold text-surface hover:bg-primary-hover disabled:opacity-60">Edit profile</button>
            {!user.venueManager && <div className="space-y-4 border-t border-border pt-5">
                <p>Want to host guests? Become a venue manager to create and manage your own venues.</p>
                <button type="button" disabled={pending} onClick={enableManager} className="min-h-12 rounded-lg bg-primary px-4 font-semibold text-surface hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60">
                  {pending ? 'Please wait…' : 'Become a venue manager'}
                </button>
            </div>}
          </>}
        </>}
        {error && <p role="alert" className="whitespace-pre-line text-danger">{error}</p>}
        {!profile && error && <button type="button" onClick={() => { setError(''); setAttempt(value => value + 1); }} className="min-h-12 rounded-lg border border-border px-4 text-primary">Try again</button>}
      </div>
    </section>
  );
}

function ProfileForm({ profile, path, onSave, onCancel }) {
  const { request } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const submitting = useRef(false);
  const inputClass = 'mt-1 min-h-12 w-full rounded-lg border border-border bg-surface px-3';

  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    submitting.current = true;
    setPending(true);
    setError('');
    try {
      const { data } = await request(path, { method: 'PUT', body: profileUpdate(values, profile) });
      onSave(data);
    } catch (error) {
      setError(error.message);
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return <form onSubmit={submit} className="space-y-5" aria-label="Edit profile">
    <fieldset disabled={pending} className="min-w-0 space-y-5">
      <legend className="mb-3 text-h3 font-semibold">Edit profile</legend>
      <div><label className="block" htmlFor="profile-bio">Bio</label><textarea id="profile-bio" name="bio" maxLength={160} rows={3} defaultValue={profile.bio ?? ''} aria-describedby="bio-help" autoFocus className={`${inputClass} py-3`} /><p id="bio-help" className="text-small text-muted">Up to 160 characters.</p></div>
      {['avatar', 'banner'].map(field => <fieldset key={field} className="min-w-0 space-y-3 rounded-lg border border-border p-4">
        <legend className="px-1 font-semibold">{field === 'avatar' ? 'Avatar' : 'Banner'}</legend>
        <label className="block text-small">Image URL<input name={`${field}Url`} type="url" maxLength={300} defaultValue={profile[field]?.url ?? ''} aria-describedby={`${field}-help`} className={inputClass} /></label>
        <label className="block text-small">Image description<input name={`${field}Alt`} maxLength={120} defaultValue={profile[field]?.alt ?? ''} className={inputClass} /></label>
        <p id={`${field}-help`} className="text-small text-muted">Use a public HTTP or HTTPS image URL. Leave blank to keep the current image and description.</p>
      </fieldset>)}
      <div className="flex flex-wrap gap-3">
        <button className="min-h-12 rounded-lg bg-primary px-5 font-semibold text-surface hover:bg-primary-hover">{pending ? 'Saving…' : 'Save'}</button>
        <button type="button" onClick={onCancel} className="min-h-12 rounded-lg border border-border px-5 font-semibold text-primary hover:bg-tint">Cancel</button>
      </div>
    </fieldset>
    {error && <p role="alert" className="whitespace-pre-line text-danger">{error}</p>}
  </form>;
}
