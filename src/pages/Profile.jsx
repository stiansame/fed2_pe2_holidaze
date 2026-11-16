import DocumentTitle from "../components/DocumentTitle.jsx";
import { messages } from "../constants/messages.js";
import Loading from "../components/Loading.jsx";
import { useEffect, useId, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext.js";
import HostAvatar from "../components/HostAvatar.jsx";
import Icon from "../components/Icon.jsx";
import VenueImage from "../components/venues/VenueImage.jsx";
import { profileUpdate } from "../utils/profile.js";
import BookingsList from "../components/bookings/BookingsList.jsx";
import ManagerOverview from "../components/account/ManagerOverview.jsx";
import AccountStats from "../components/account/AccountStats.jsx";
import { guestSummary } from "../utils/bookings.js";

/**
 * Combines the signed-in profile, role-appropriate statistics and upcoming personal stays.
 * @returns {import('react').ReactNode}
 */
export default function Profile() {
  const id = useId();
  const overviewHeadingId = `account-overview-heading-${id}`;
  const { user } = useAuth();
  const [bookings, setBookings] = useState(null);
  const stats = guestSummary(bookings, undefined, true);
  const profile = <ProfileCard />;
  return (
    <section className="min-w-0 space-y-6">
      <DocumentTitle>Holidaze | My account</DocumentTitle>
      <h1 className="text-h3 font-bold sm:text-h2">My account</h1>
      {user.venueManager ? (
        <ManagerOverview stats={stats}>{profile}</ManagerOverview>
      ) : (
        <section
          className="grid items-start gap-4 lg:items-stretch lg:grid-cols-2"
          aria-labelledby={overviewHeadingId}
        >
          <h2 id={overviewHeadingId} className="sr-only">
            Account overview
          </h2>
          {profile}
          <AccountStats items={stats} />
        </section>
      )}
      <BookingsList upcomingOnly onLoaded={setBookings} />
    </section>
  );
}

/**
 * Loads the shared profile and controls editing and manager registration.
 * @returns {import('react').ReactNode}
 */
function ProfileCard() {
  const { user, profile, setProfile, request, becomeManager } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const path = `holidaze/profiles/${encodeURIComponent(user.name)}`;

  useEffect(() => {
    const controller = new AbortController();
    request(path, { signal: controller.signal })
      .then(({ data }) => {
        if (!controller.signal.aborted) setProfile(data);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      });
    return () => controller.abort();
  }, [path, request, attempt, setProfile]);

  /**
   * Enables hosting through the account provider and displays any returned error.
   * @returns {Promise<void>}
   */
  async function enableManager() {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      await becomeManager();
    } catch (error) {
      setError(error.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-border bg-surface">
      {profile && (
        <div className="relative">
          <VenueImage
            key={profile.banner?.url}
            media={profile.banner}
            name={`${user.name}'s banner`}
            className="h-40"
            loading="eager"
          />
          {!editing && (
            <button
              type="button"
              disabled={pending}
              aria-label="Edit profile"
              title="Edit profile"
              onClick={() => {
                setSaved(false);
                setError("");
                setEditing(true);
              }}
              className="edit-icon-button absolute bottom-3 right-3 disabled:opacity-60"
            >
              <Icon name="edit" />
            </button>
          )}
        </div>
      )}
      <div
        className={`space-y-5 px-5 pb-5 sm:px-8 sm:pb-8 ${profile ? "" : "pt-5 sm:pt-8"}`}
      >
        {!profile && !error && <Loading>Loading your profile…</Loading>}
        {profile && (
          <>
            <div className="relative flex flex-col gap-3 xl:flex-row xl:items-start xl:gap-6">
              <HostAvatar
                key={profile.avatar?.url}
                media={profile.avatar}
                className="-mt-14 size-28 border-4 border-surface bg-surface sm:-mt-16 sm:size-32"
              />
              <div className="min-w-0 flex-1 xl:pt-3">
                <h3 className="text-h3 font-bold wrap-anywhere">
                  {profile.name}
                </h3>
                {user.venueManager && (
                  <span className="pill mt-2 bg-tint text-caption font-semibold text-primary">
                    Venue manager
                  </span>
                )}
              </div>
            </div>
            <p className="text-small text-muted wrap-anywhere">
              {profile.email}
            </p>
            {editing ? (
              <ProfileForm
                profile={profile}
                path={path}
                onCancel={() => setEditing(false)}
                onSave={(data) => {
                  setProfile(data);
                  setEditing(false);
                  setSaved(true);
                }}
              />
            ) : (
              <>
                <p className="whitespace-pre-line text-muted wrap-anywhere">
                  {profile.bio?.trim() || "No bio yet."}
                </p>
                {saved && (
                  <p role="status" className="text-success">
                    {messages.profileUpdated}
                  </p>
                )}

                {!user.venueManager && (
                  <div className="space-y-4 border-t border-border pt-5">
                    <p>
                      Want to host guests? Become a venue manager to create and
                      manage your own venues.
                    </p>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={enableManager}
                      className="h-11 rounded-lg bg-primary px-4 font-semibold text-surface hover:bg-primary-hover disabled:cursor-wait disabled:opacity-60"
                    >
                      {pending ? "Please wait…" : "Become a venue manager"}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
        {error && (
          <p role="alert" className="whitespace-pre-line text-danger">
            {error}
          </p>
        )}
        {!profile && error && (
          <button
            type="button"
            onClick={() => {
              setError("");
              setAttempt((value) => value + 1);
            }}
            className="h-11 rounded-lg border border-border px-4 text-primary"
          >
            Try again
          </button>
        )}
      </div>
    </section>
  );
}

/**
 * Validates profile changes and reports saved data to its parent.
 * @param {object} props Component props.
 * @param {object} props.profile Current profile data.
 * @param {string} props.path Profile API path.
 * @param {Function} props.onSave Saves validated input or receives saved data.
 * @param {Function} props.onCancel Returns without saving.
 * @returns {import('react').ReactNode}
 */
function ProfileForm({ profile, path, onSave, onCancel }) {
  const { request } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const fieldClass =
    "mt-1 w-full rounded-lg border border-border bg-surface px-3";
  const inputClass = `${fieldClass} h-11`;

  /**
   * Validates profile input, saves changes and returns the updated profile to the parent.
   * @param {import('react').SubmitEvent<HTMLFormElement>} event Form submission event.
   * @returns {Promise<void>}
   */
  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    submitting.current = true;
    setPending(true);
    setError("");
    try {
      const { data } = await request(path, {
        method: "PUT",
        body: profileUpdate(values, profile),
      });
      onSave(data);
    } catch (error) {
      setError(error.message);
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5" aria-label="Edit profile">
      <fieldset disabled={pending} className="min-w-0 space-y-5">
        <legend className="mb-3 text-h3 font-semibold">Edit profile</legend>
        <div>
          <label className="block" htmlFor="profile-bio">
            Bio
          </label>
          <textarea
            id="profile-bio"
            name="bio"
            maxLength={160}
            rows={3}
            defaultValue={profile.bio ?? ""}
            aria-describedby="bio-help"
            autoFocus
            className={`${fieldClass} min-h-11 py-3`}
          />
          <p id="bio-help" className="text-small text-muted">
            Up to 160 characters.
          </p>
        </div>
        {["avatar", "banner"].map((field) => (
          <fieldset
            key={field}
            className="min-w-0 space-y-3 rounded-lg border border-border p-4"
          >
            <legend className="px-1 font-semibold">
              {field === "avatar" ? "Avatar" : "Banner"}
            </legend>
            <label className="block text-small">
              Image URL
              <input
                name={`${field}Url`}
                type="url"
                maxLength={300}
                defaultValue={profile[field]?.url ?? ""}
                aria-describedby={`${field}-help`}
                className={inputClass}
              />
            </label>
            <label className="block text-small">
              Image description
              <input
                name={`${field}Alt`}
                maxLength={120}
                defaultValue={profile[field]?.alt ?? ""}
                className={inputClass}
              />
            </label>
            <p id={`${field}-help`} className="text-small text-muted">
              Use a public HTTP or HTTPS image URL. Leave blank to keep the
              current image and description.
            </p>
          </fieldset>
        ))}
        <div className="flex flex-wrap gap-3">
          <button className="h-11 rounded-lg bg-primary px-5 font-semibold text-surface hover:bg-primary-hover">
            {pending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="h-11 rounded-lg border border-border px-5 font-semibold text-primary hover:bg-tint"
          >
            Cancel
          </button>
        </div>
      </fieldset>
      {error && (
        <p role="alert" className="whitespace-pre-line text-danger">
          {error}
        </p>
      )}
    </form>
  );
}
