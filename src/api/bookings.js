import { ApiError } from './client.js';
import { getVenue } from './venues.js';
import { staySummary } from '../utils/availability.js';

export async function createBooking(request, venueId, stay, expectedPrice) {
  // Recheck immediately before POST; the API still decides whether the booking can be saved.
  const { data: venue } = await getVenue(venueId);
  const summary = staySummary(venue, stay);
  if (summary.error) throw new ApiError(summary.error);
  if (venue.price !== expectedPrice) return { venue, booking: null };
  try {
    const { data: booking } = await request('holidaze/bookings', {
      method: 'POST', body: {
        venueId, dateFrom: `${stay.from}T00:00:00.000Z`, dateTo: `${stay.to}T00:00:00.000Z`, guests: stay.guests,
      },
    });
    if (!booking?.id) throw new ApiError('The server did not return a booking reference.');
    return { venue, booking };
  } catch (error) {
    // A lost response may follow a saved booking. Do not invite an unsafe second POST.
    error.bookingUncertain = !error.status || error.status >= 500 || (error.status >= 200 && error.status < 300);
    throw error;
  }
}
