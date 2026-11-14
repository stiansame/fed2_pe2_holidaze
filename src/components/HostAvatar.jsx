import { useState } from 'react';
import placeholder from '../assets/host-placeholder.svg';

/**
 * Displays a profile avatar, replacing missing or failed images with the shared placeholder.
 * @param {object} props Component props.
 * @param {object} [props.media] Avatar URL and optional alt text.
 * @param {string} [props.className] Additional styling classes.
 * @returns {import('react').ReactNode}
 */
export default function HostAvatar({ media, className = 'size-12' }) {
  const [failed, setFailed] = useState(false);
  return <img src={(!failed && media?.url?.trim()) || placeholder} alt="" onError={() => setFailed(true)} width="48" height="48" className={`shrink-0 rounded-full object-cover ${className}`} />;
}
