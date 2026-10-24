import { useState } from 'react';
import placeholder from '../assets/host-placeholder.svg';

export default function HostAvatar({ media, className = 'size-12' }) {
  const [failed, setFailed] = useState(false);
  return <img src={(!failed && media?.url?.trim()) || placeholder} alt="" onError={() => setFailed(true)} width="48" height="48" className={`shrink-0 rounded-full object-cover ${className}`} />;
}
