import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);
/**
 * Reads the account state and actions supplied by AuthProvider.
 * @returns {object|null}
 */
export const useAuth = () => useContext(AuthContext);
