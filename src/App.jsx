import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import ComingSoon from './pages/ComingSoon.jsx';
import Layout from './components/layout/Layout.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/venues" element={<ComingSoon title="Explore venues" />} />
        <Route path="/login" element={<ComingSoon title="Log in" />} />
        <Route path="/register" element={<ComingSoon title="Create your account" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
