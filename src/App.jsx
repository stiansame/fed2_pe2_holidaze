import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import ComingSoon from './pages/ComingSoon.jsx';
import Layout from './components/layout/Layout.jsx';
import AuthForm from './pages/AuthForm.jsx';
import RequireAuth from './auth/RequireAuth.jsx';
import Profile from './pages/Profile.jsx';
import Venues from './pages/Venues.jsx';
import VenueDetails from './pages/VenueDetails.jsx';
import BookingReview from './pages/BookingReview.jsx';
import BookingConfirmation from './pages/BookingConfirmation.jsx';
import AccountLayout from './components/layout/AccountLayout.jsx';
import MyBookings from './pages/MyBookings.jsx';
import BookingEdit from './pages/BookingEdit.jsx';
import PublicProfile from './pages/PublicProfile.jsx';
import ManagerDashboard from './pages/ManagerDashboard.jsx';
import MyVenues from './pages/MyVenues.jsx';
import CreateVenue from './pages/CreateVenue.jsx';
import EditVenue from './pages/EditVenue.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/venues" element={<Venues />} />
        <Route path="/venues/:id" element={<VenueDetails />} />
        <Route path="/login" element={<AuthForm key="login" />} />
        <Route path="/register" element={<AuthForm key="register" register />} />
        <Route element={<RequireAuth />}>
          <Route path="/profiles/:name" element={<PublicProfile />} />
          <Route path="/venues/:id/reserve" element={<BookingReview />} />
          <Route element={<AccountLayout />}>
            <Route path="/bookings/:id/confirmation" element={<BookingConfirmation />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/bookings/:id/edit" element={<BookingEdit />} />
            <Route element={<RequireAuth manager />}>
              <Route path="/manager" element={<ManagerDashboard />} />
              <Route path="/manager/venues" element={<MyVenues />} />
              <Route path="/manager/venues/new" element={<CreateVenue />} />
              <Route path="/manager/venues/:id/edit" element={<EditVenue />} />
              <Route path="/manager/bookings" element={<ComingSoon title="Venue bookings" />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
