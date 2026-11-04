import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerUrl from 'leaflet/dist/images/marker-icon.png';
import markerRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { venueCoordinates } from '../../utils/venueForm.js';

const icon = L.icon({
  iconUrl: markerUrl, iconRetinaUrl: markerRetinaUrl, shadowUrl,
  iconSize: [25, 41], iconAnchor: [12, 41], shadowSize: [41, 41],
});

export default function VenueLocationMap({ lat, lng, onChange, disabled }) {
  const container = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    const instance = L.map(container.current, { scrollWheelZoom: true, worldCopyJump: true }).setView([20, 0], 2);
    map.current = instance;
    marker.current = L.marker([0, 0], { icon, alt: 'Venue location' });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).on('tileerror', () => setTileError(true)).on('tileload', () => setTileError(false)).addTo(instance);
    return () => { instance.remove(); map.current = null; marker.current = null; };
  }, []);

  useEffect(() => {
    const instance = map.current;
    if (disabled || !onChange) return;
    function select({ latlng }) {
      const point = latlng.wrap();
      onChange({ lat: point.lat.toFixed(6), lng: point.lng.toFixed(6) });
    }
    instance.on('click', select);
    return () => { instance.off('click', select); };
  }, [disabled, onChange]);

  useEffect(() => {
    const point = venueCoordinates(lat, lng);
    if (!point) { marker.current.remove(); return; }
    marker.current.setLatLng(point).addTo(map.current);
    map.current.setView(point, 15, { animate: false });
  }, [lat, lng]);

  return <div className="min-w-0 space-y-2">
    <div ref={container} role="region" aria-label={onChange ? 'Choose venue location' : 'Venue location'} aria-describedby={onChange ? 'venue-map-help' : undefined} className="relative isolate z-0 h-72 w-full rounded-lg border border-border sm:h-80" />
    {onChange && <>
      <p id="venue-map-help" className="text-small text-muted">Click the map to set coordinates. Enter the address manually.</p>
      <button type="button" disabled={disabled} className="navigation-link" onClick={() => {
        const point = map.current.getCenter().wrap();
        onChange({ lat: point.lat.toFixed(6), lng: point.lng.toFixed(6) });
      }}>Use map centre</button>
    </>}
    {tileError && <p role="status" className="text-small text-muted">Map images could not be loaded.{onChange && ' You can still enter coordinates manually.'}</p>}
  </div>;
}
