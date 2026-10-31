import BookingsList from '../components/bookings/BookingsList.jsx';

export default function MyBookings() {
  return <section className="space-y-6">
    <title>Holidaze | My bookings</title>
    <h1 className="text-h3 font-bold sm:text-h2">My bookings</h1>
    <BookingsList />
  </section>;
}
