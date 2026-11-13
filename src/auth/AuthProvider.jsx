import { messages } from '../constants/messages.js';
import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../api/client.js';
import { AuthContext } from './AuthContext.js';
import { readSession, SESSION_KEY, sessionExpiresAt } from './session.js';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readSession(localStorage));
  const [notice, setNotice] = useState('');
  const [profile, setProfile] = useState(null);

  const logout = useCallback((message = '') => {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setProfile(null);
    setNotice(message);
  }, []);

  async function login(credentials) {
    const { data } = await apiRequest('auth/login', {
      method: 'POST', query: { _holidaze: true }, body: credentials,
    });
    const session = {
      name: data.name, email: data.email, venueManager: data.venueManager === true,
      accessToken: data.accessToken, avatar: data.avatar,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setNotice('');
    setProfile(data);
    setUser(session);
    return session;
  }

  // Authenticated feature calls use this wrapper so a rejected token ends the session.
  const request = useCallback(async (path, options = {}) => {
    try {
      return await apiRequest(path, { ...options, token: user?.accessToken });
    } catch (error) {
      if (error.status === 401) logout(messages.sessionEnded);
      throw error;
    }
  }, [user, logout]);

  async function becomeManager() {
    const { data } = await request(`holidaze/profiles/${encodeURIComponent(user.name)}`, {
      method: 'PUT', body: { venueManager: true },
    });
    // Do not restore a session that was logged out while the request was pending.
    if (readSession(localStorage)?.accessToken !== user.accessToken) return;
    const session = { ...user, venueManager: data.venueManager === true };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    setProfile(data);
  }

  // Keep the menu avatar current after a reload on any account page.
  useEffect(() => {
    if (!user || profile?.name !== user.name) return;
    const session = readSession(localStorage);
    if (session?.accessToken === user.accessToken) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, avatar: profile.avatar }));
    }
  }, [profile, user]);

  useEffect(() => {
    if (!user) return;
    const timer = setInterval(() => {
      if (sessionExpiresAt(user) > Date.now()) return;
      logout(messages.sessionExpired);
    }, 1000);
    return () => clearInterval(timer);
  }, [user, logout]);

  return <AuthContext.Provider value={{ user, profile, setProfile, notice, login, logout, request, becomeManager }}>{children}</AuthContext.Provider>;
}
