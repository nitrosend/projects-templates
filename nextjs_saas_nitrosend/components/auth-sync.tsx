'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect, useRef } from 'react';

export function AuthSync() {
  const { isLoaded, isSignedIn, sessionId } = useAuth();
  const lastSyncedSessionID = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !sessionId || lastSyncedSessionID.current === sessionId) {
      return;
    }

    lastSyncedSessionID.current = sessionId;

    void fetch('/auth/sync', {
      credentials: 'same-origin',
      method: 'POST',
    })
      .then(() => undefined)
      .catch(() => {
        lastSyncedSessionID.current = null;
      });
  }, [isLoaded, isSignedIn, sessionId]);

  return null;
}
