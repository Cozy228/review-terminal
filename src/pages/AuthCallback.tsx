import { useEffect } from 'react';

export function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ok = params.get('ok') === 'true' || !params.get('error');
    const user = params.get('user') || params.get('login') || null;
    const targetOrigin = window.location.origin;

    console.log('AuthCallback: sending postMessage', { ok, hasOpener: !!window.opener });

    if (window.opener && !window.opener.closed) {
      try {
        window.opener.postMessage(
          {
            type: 'ghe-auth-complete',
            ok,
            user,
            error: params.get('error') || null,
          },
          targetOrigin
        );
        console.log('AuthCallback: postMessage sent successfully');
      } catch (error) {
        console.error('AuthCallback: postMessage failed', error);
      }
    } else {
      console.warn('AuthCallback: no opener window found');
    }

    // Close window after a short delay to ensure message is sent
    setTimeout(() => {
      window.close();
    }, 100);
  }, []);

  // Minimal fallback UI in case window.close() fails
  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', color: '#e6edf3', background: '#0a0e1a', minHeight: '100vh' }}>
      <p>Completing authentication...</p>
      <p>If this window doesn&apos;t close automatically, you can close it manually.</p>
    </div>
  );
}
