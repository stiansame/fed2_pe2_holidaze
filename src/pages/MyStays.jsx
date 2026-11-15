import DocumentTitle from '../components/DocumentTitle.jsx';
import { useState } from 'react';
import BookingsList from '../components/bookings/BookingsList.jsx';
import Icon from '../components/Icon.jsx';

/**
 * Provides the My stays heading, refresh action and shared customer booking list.
 * @returns {import('react').ReactNode}
 */
export default function MyStays() {
  const [attempt, setAttempt] = useState(0);
  return <section className="space-y-6">
    <DocumentTitle>Holidaze | My stays</DocumentTitle>
    <div className="flex items-center gap-2">
      <h1 className="text-h3 font-bold sm:text-h2">My stays</h1>
      <button type="button" aria-label="Refresh stays" title="Refresh stays" onClick={() => setAttempt(value => value + 1)} className="navigation-link size-11 shrink-0 justify-center p-0"><Icon name="reset" /></button>
    </div>
    <BookingsList key={attempt} />
  </section>;
}
