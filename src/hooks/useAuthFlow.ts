import { useCallback, useEffect, useRef, useState } from 'react';

type AuthStage = 'redirecting' | 'loading';

interface UseAuthFlowOptions {
  onSuccess: (user?: string | null) => void;
}

export function useAuthFlow({ onSuccess }: UseAuthFlowOptions) {
  const [authStage, setAuthStage] = useState<AuthStage>('redirecting');
  const [authError, setAuthError] = useState<string | null>(null);
  const authWindowRef = useRef<Window | null>(null);
  const popupInFlightRef = useRef(false);

  const closePopup = useCallback(() => {
    if (authWindowRef.current && !authWindowRef.current.closed) {
      authWindowRef.current.close();
    }
    authWindowRef.current = null;
  }, []);

  const handleAuthSuccess = useCallback((user?: string | null) => {
    setAuthStage('loading');
    setAuthError(null);
    onSuccess(user);
    closePopup();
  }, [closePopup, onSuccess]);

  const handleAuthFailure = useCallback((message: string) => {
    setAuthError(message);
    setAuthStage('redirecting');
    closePopup();
  }, [closePopup]);

  // Fetch authorize URL from backend
  const getAuthorizeUrl = useCallback(async (): Promise<string | null> => {
    const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
    try {
      const res = await fetch(`${apiBase}/auth/github-enterprise/authorize`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data?.error) {
        setAuthError(`Authorize error: ${data.error}`);
        return null;
      }
      return data?.url || null;
    } catch (error) {
      console.warn('Authorize fetch failed', error);
      setAuthError('Authorize fetch failed. Please retry.');
      return null;
    }
  }, []);

  // Combined function: fetch URL and open popup
  const fetchAndOpenPopup = useCallback(async () => {
    if (popupInFlightRef.current) return;
    setAuthError(null);
    setAuthStage('redirecting');
    popupInFlightRef.current = true;

    // Close any existing popup before opening a new one
    if (authWindowRef.current && !authWindowRef.current.closed) {
      authWindowRef.current.close();
    }

    const url = await getAuthorizeUrl();
    if (!url) {
      setAuthError('Missing authorize URL. Check backend /auth/github-enterprise/authorize.');
      popupInFlightRef.current = false;
      return;
    }

    // Must NOT use 'noopener' as it breaks window.opener reference needed for postMessage
    const popupWindow = window.open(url, '_blank', 'width=520,height=640');
    if (!popupWindow) {
      setAuthError('Popup blocked. Please allow popups and retry.');
      popupInFlightRef.current = false;
      return;
    }

    authWindowRef.current = popupWindow;

    popupInFlightRef.current = false;
  }, [getAuthorizeUrl]);

  const retryAuth = useCallback(() => {
    void fetchAndOpenPopup();
  }, [fetchAndOpenPopup]);

  const resetAuth = useCallback(() => {
    setAuthError(null);
    setAuthStage('redirecting');
    closePopup();
    popupInFlightRef.current = false;
  }, [closePopup]);

  // Listen for messages from callback page
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('Main window received message:', event.data, 'from origin:', event.origin);
      
      // Verify origin matches our window origin
      if (event.origin !== window.location.origin) {
        console.warn('Message from unexpected origin:', event.origin);
        return;
      }
      
      if (event.data?.type === 'ghe-auth-complete') {
        console.log('Processing ghe-auth-complete message:', event.data);
        console.log('User from message:', event.data.user);
        if (event.data.ok === false || event.data.error) {
          handleAuthFailure(event.data.error || 'Authorization failed.');
          return;
        }
        handleAuthSuccess(event.data.user || null);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleAuthFailure, handleAuthSuccess]);

  // Detect popup closed before success
  useEffect(() => {
    const interval = setInterval(() => {
      if (authStage === 'redirecting' && authWindowRef.current && authWindowRef.current.closed) {
        handleAuthFailure('Authorization window was closed. Retry?');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [authStage, handleAuthFailure]);

  return {
    authStage,
    authError,
    fetchAndOpenPopup,
    retryAuth,
    resetAuth,
  };
}
