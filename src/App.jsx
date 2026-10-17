import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import ComingSoon from './pages/ComingSoon.jsx';
import Layout from './components/layout/Layout.jsx';
import AuthForm from './pages/AuthForm.jsx';
import RequireAuth from './auth/RequireAuth.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/venues" element={<ComingSoon title="Explore venues" />} />
        <Route path="/login" element={<AuthForm key="login" />} />
        <Route path="/register" element={<AuthForm key="register" register />} />
        <Route element={<RequireAuth />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/bookings" element={<ComingSoon title="My bookings" />} />
        </Route>
        <Route element={<RequireAuth manager />}>
          <Route path="/manager" element={<ComingSoon title="Manager dashboard" />} />
          <Route path="/manager/venues" element={<ComingSoon title="My venues" />} />
          <Route path="/manager/venues/new" element={<ComingSoon title="Create venue" />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
