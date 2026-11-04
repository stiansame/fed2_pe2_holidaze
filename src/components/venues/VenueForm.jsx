import Loading from '../Loading.jsx';
import { lazy, Suspense, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { amenityOptions } from './amenityOptions.js';
import AmenityPill from './AmenityPill.jsx';
import Icon from '../Icon.jsx';

const VenueLocationMap = lazy(() => import('./VenueLocationMap.jsx'));

const inputClass = 'mt-1 min-h-12 w-full min-w-0 rounded-lg border border-border bg-surface px-3 font-normal';
const sectionClass = 'min-w-0 space-y-4 rounded-xl border border-border bg-surface p-4 sm:p-6';

export default function VenueForm({ onSave, onCancel }) {
  const [mediaKeys, setMediaKeys] = useState([0]);
  const nextKey = useRef(1);
  const submitting = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [uncertain, setUncertain] = useState(false);
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '' });
  const [amenities, setAmenities] = useState([]);

  async function submit(event) {
    event.preventDefault();
    if (submitting.current || uncertain) return;
    const form = new FormData(event.currentTarget);
    submitting.current = true;
    setPending(true);
    setError('');
    try {
      await onSave(form);
    } catch (error) {
      setError(error.message);
      setUncertain(Boolean(error.venueUncertain));
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return <form onSubmit={submit} aria-label="Create venue" className="min-w-0 space-y-5">
    <fieldset disabled={pending || uncertain} className="min-w-0 space-y-5">
      <legend className="sr-only">Venue information</legend>
      <section className={sectionClass} aria-labelledby="venue-basics">
        <h2 id="venue-basics" className="text-h3 font-semibold">About your venue</h2>
        <p className="text-small text-muted">Name, description, price and guest capacity are required.</p>
        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-4">
            <label className="block text-small font-semibold">Venue name<input name="name" required className={inputClass} /></label>
            <label className="block text-small font-semibold">Description<textarea name="description" required rows={4} className={`${inputClass} py-3`} /></label>
          </div>
          <div className="min-w-0 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block min-w-0 text-small font-semibold">Price per night (NOK)<input name="price" type="number" required min="0" step="0.01" inputMode="decimal" className={inputClass} /></label>
              <label className="block min-w-0 text-small font-semibold">Maximum guests<input name="maxGuests" type="number" required min="1" step="1" inputMode="numeric" className={inputClass} /></label>
            </div>
            <div role="group" aria-labelledby="venue-amenities" className="space-y-3">
              <h3 id="venue-amenities" className="font-semibold">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {amenityOptions.map(item => <AmenityPill key={item.key} item={item} selected={amenities.includes(item.key)} onClick={() => setAmenities(values => values.includes(item.key) ? values.filter(key => key !== item.key) : [...values, item.key])} />)}
                {amenities.map(key => <input key={key} type="hidden" name={key} value="true" />)}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className={sectionClass} aria-labelledby="venue-images">
        <h2 id="venue-images" className="text-h3 font-semibold">Photos</h2>
        <p className="text-small text-muted">Optional. Use public HTTP or HTTPS image URLs. The first image is the cover photo.</p>
        {mediaKeys.map((key, index) => <fieldset key={key} className="grid min-w-0 items-end gap-3 rounded-lg border border-border p-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto] lg:border-0 lg:p-0">
          <legend className="px-1 text-small font-semibold">Image {index + 1}</legend>
          <label className="block min-w-0 text-small font-semibold">Image URL<input name="mediaUrl" type="url" maxLength={300} className={inputClass} /></label>
          <label className="block min-w-0 text-small font-semibold">Alt text<input name="mediaAlt" maxLength={120} className={inputClass} /></label>
          <button type="button" onClick={() => setMediaKeys(keys => keys.filter(value => value !== key))} aria-label={`Remove image ${index + 1}`} className="inline-flex size-12 items-center justify-center rounded-lg border border-border text-danger hover:bg-danger/10"><Icon name="trash" /></button>
        </fieldset>)}
        <button type="button" onClick={() => { const key = nextKey.current++; setMediaKeys(keys => [...keys, key]); }} className="navigation-link gap-2"><Icon name="plus" />Add image</button>
      </section>
      <section className={sectionClass} aria-labelledby="venue-location">
        <h2 id="venue-location" className="text-h3 font-semibold">Location</h2>
        <div className="grid min-w-0 items-start gap-6 lg:grid-cols-2">
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            {[
              ['address', 'Street address'], ['zip', 'Postal code'], ['city', 'City'],
              ['country', 'Country'], ['continent', 'Continent'],
            ].map(([name, label]) => <label key={name} className={`block min-w-0 text-small font-semibold ${name === 'address' ? 'sm:col-span-2' : ''}`}>{label}<input name={name} className={inputClass} /></label>)}
            <label className="block min-w-0 text-small font-semibold">Latitude<input name="lat" type="number" min="-90" max="90" step="any" value={coordinates.lat} onChange={event => setCoordinates(value => ({ ...value, lat: event.target.value }))} className={inputClass} /></label>
            <label className="block min-w-0 text-small font-semibold">Longitude<input name="lng" type="number" min="-180" max="180" step="any" value={coordinates.lng} onChange={event => setCoordinates(value => ({ ...value, lng: event.target.value }))} className={inputClass} /></label>
          </div>
          <Suspense fallback={<Loading>Loading map…</Loading>}>
            <VenueLocationMap {...coordinates} onChange={setCoordinates} disabled={pending || uncertain} />
          </Suspense>
        </div>
      </section>
      <div className="flex flex-wrap gap-3">
        <button type="submit" className="min-h-12 rounded-lg bg-primary px-5 font-semibold text-surface hover:bg-primary-hover disabled:opacity-60">{pending ? 'Creating…' : 'Create venue'}</button>
        <button type="button" onClick={onCancel} className="navigation-link">Cancel</button>
      </div>
    </fieldset>
    {error && <p role="alert" className="whitespace-pre-line text-danger">{error}</p>}
    {uncertain && <p role="status" className="text-muted">Your venue may have been created. Check <Link to="/manager/venues" className="font-semibold text-primary underline">My venues</Link> before trying again.</p>}
  </form>;
}
