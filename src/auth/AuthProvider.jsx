import { useEffect, useState } from 'react';
import { apiRequest } from '../api/client.js';
import { AuthContext } from './AuthContext.js';
import { readSession, SESSION_KEY, sessionExpiresAt } from './session.js';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession(localStorage));
  const [notice, setNotice] = useState('');

  function logout(message = '') {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setNotice(message);
  }

  async function login(credentials) {
    const { data } = await apiRequest('auth/login', {
      method: 'POST', query: { _holidaze: true }, body: credentials,
    });
    const session = {
      name: data.name, email: data.email, venueManager: data.venueManager === true,
      accessToken: data.accessToken,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setNotice('');
    setUser(session);
    return session;
  }

  // Authenticated feature calls use this wrapper so a rejected token ends the session.
  async function request(path, options = {}) {
    try {
      return await apiRequest(path, { ...options, token: user?.accessToken });
    } catch (error) {
      if (error.status === 401) logout('Your session has ended. Please log in again.');
      throw error;
    }
  }

  useEffect(() => {
    if (!user) return;
    const timer = setInterval(() => {
      if (sessionExpiresAt(user) > Date.now()) return;
      localStorage.removeItem(SESSION_KEY);
      setUser(null);
      setNotice('Your session has expired. Please log in again.');
    }, 1000);
    return () => clearInterval(timer);
  }, [user]);

  return <AuthContext.Provider value={{ user, notice, login, logout, request }}>{children}</AuthContext.Provider>;
}
