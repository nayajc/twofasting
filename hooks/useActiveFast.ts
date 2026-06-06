'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from './useAuth';
import { subscribeActiveFast } from '@/lib/firestore';
import type { ActiveFast } from '@/types';

export function useActiveFast() {
  const { user } = useAuth();
  const [activeFast, setActiveFast] = useState<ActiveFast | null>(null);
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!user) {
      setActiveFast(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = subscribeActiveFast(user.uid, fast => {
      setActiveFast(fast);
      setLoading(false);
    });
    unsubRef.current = unsub;

    return () => {
      unsub();
      unsubRef.current = null;
    };
  }, [user?.uid]);

  return { activeFast, loading };
}
