import { useContext } from 'react';
import { AuthContext } from './authContext';

/** @returns {NonNullable<import('react').ContextType<typeof AuthContext>>} */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
