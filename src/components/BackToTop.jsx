import { useEffect, useState } from 'react';
import Icon from './Icon.jsx';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const update = () => setVisible(window.scrollY > 200);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return visible && <button type="button" aria-label="Back to top" title="Back to top" className="back-to-top fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 flex size-11 items-center justify-center rounded-full border border-border bg-surface text-primary hover:bg-tint" onClick={() => {
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }}>
    <Icon name="left" className="size-5 rotate-90" />
  </button>;
}
