'use client';
import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { subscribeToAuth, handleRedirectResult } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  unsubscribers: React.MutableRefObject<(() => void)[]>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  unsubscribers: { current: [] },
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const unsubscribers = useRef<(() => void)[]>([]);

  useEffect(() => {
    handleRedirectResult().catch(() => {});

    const unsub = subscribeToAuth(u => {
      setUser(u);
      setLoading(false);
      if (!u) {
        unsubscribers.current.forEach(fn => fn());
        unsubscribers.current = [];
      }
    });

    return () => unsub();
  }, []);

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, loading, unsubscribers }}>
      {children}
    </AuthContext.Provider>
  );
}
