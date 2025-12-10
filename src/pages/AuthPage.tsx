import { forwardRef } from 'react';
import { Check } from 'lucide-react';

interface AuthPageProps {
  authStage: 'redirecting' | 'loading';
  authError?: string | null;
  authDataReady?: boolean;
  onRetry?: () => void;
}

export const AuthPage = forwardRef<HTMLDivElement, AuthPageProps>(
  ({ authStage, authError, authDataReady, onRetry }, ref) => {
    const showRedirect = authStage === 'redirecting';
    const showPacman = authStage === 'loading';

    return (
      <div 
        ref={ref}
        className="fixed inset-0 flex flex-col items-center justify-center px-6 md:px-24"
        style={{ display: 'none', paddingTop: '40px' }}
        data-auth-stage={authStage}
      >
        <div className="auth-content max-w-2xl w-full px-6">
          <div className="flex items-center gap-4 mb-3">
            <span className="auth-line-0" style={{ color: 'var(--text-primary)' }}></span>
            <Check className="auth-check-0" size={16} style={{ opacity: 0, color: 'var(--accent-success)' }} />
          </div>
          <div className="flex items-center gap-4 mb-3">
            <span className="auth-line-1" style={{ color: 'var(--text-primary)' }}></span>
            <Check className="auth-check-1" size={16} style={{ opacity: 0, color: 'var(--accent-success)' }} />
          </div>
          <div className="flex items-center gap-4 mb-3">
            <span className="auth-line-2" style={{ color: 'var(--text-primary)' }}></span>
            <Check className="auth-check-2" size={16} style={{ opacity: 0, color: 'var(--accent-success)' }} />
          </div>
          
          <div 
            className="auth-redirect my-8 p-6 text-center" 
            style={{ border: '2px dashed var(--accent-info)', opacity: 0, display: showRedirect ? 'block' : 'none' }}
          >
            <div className="text-lg font-medium mb-3" style={{ color: 'var(--accent-info)' }}>
              Redirecting to GitHub...
            </div>
            {/* <div className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              https://github.com/login/oauth/authorize
            </div> */}
            {showRedirect && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ color: 'var(--accent-info)' }}></div>
                <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ color: 'var(--accent-info)', animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ color: 'var(--accent-info)', animationDelay: '0.4s' }}></div>
              </div>
            )}
            {authError && (
              <div className="mt-4 text-sm" style={{ color: 'var(--accent-error)' }}>
                {authError}{' '}
                {onRetry && (
                  <button className="underline" onClick={onRetry} type="button">
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>

          <div 
            className="auth-pacman my-8 p-6 text-center" 
            style={{ border: '2px dashed var(--accent-success)', opacity: 0, display: showPacman ? 'block' : 'none' }}
          >
            <div className="text-lg font-medium mb-2" style={{ color: authDataReady ? 'var(--accent-success)' : 'var(--accent-warning)' }}>
              {authDataReady ? 'Data loaded. Building...' : 'GitHub session established. Loading data...'}
            </div>
            <div className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {authDataReady ? 'Preparing build. Transitioning shortly.' : 'Fetching commits, stack, and workflow. One sec.'}
            </div>
            <div className="flex flex-col items-center gap-3 auth-pacman-track">
              <div className="px-6 py-4">
                <div className="auth-pacman-lane" style={{ position: 'relative', width: '280px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg 
                    className="auth-pacman-svg"
                    width="48" 
                    height="48" 
                    viewBox="0 0 24 24" 
                    style={{ 
                      position: 'absolute',
                      left: '0',
                      fill: 'var(--text-primary)',
                      shapeRendering: 'crispEdges',
                      imageRendering: 'pixelated'
                    }}
                  >
                    <path d="M12,23a10.927,10.927,0,0,0,7.778-3.222,1,1,0,0,0,0-1.414L13.414,12l6.364-6.364a1,1,0,0,0,0-1.414A11,11,0,1,0,12,23ZM12,3a8.933,8.933,0,0,1,5.618,1.967l-6.325,6.326a1,1,0,0,0,0,1.414l6.325,6.326A9,9,0,1,1,12,3Z"/>
                  </svg>
                  <div className="auth-pellets" style={{ display: 'flex', gap: '16px', marginLeft: '60px' }}>
                    <span className="auth-pellet" data-index="0" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-primary)', opacity: 0.8 }} />
                    <span className="auth-pellet" data-index="1" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-primary)', opacity: 0.8 }} />
                    <span className="auth-pellet" data-index="2" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-primary)', opacity: 0.8 }} />
                    <span className="auth-pellet" data-index="3" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-primary)', opacity: 0.8 }} />
                    <span className="auth-pellet" data-index="4" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-primary)', opacity: 0.8 }} />
                    <span className="auth-pellet" data-index="5" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-primary)', opacity: 0.8 }} />
                  </div>
                </div>
              </div>
              <div className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-dim)' }}>
                FETCHING DATA
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

AuthPage.displayName = 'AuthPage';
