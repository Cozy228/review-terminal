import { forwardRef } from 'react';
import { Check } from 'lucide-react';

interface AuthPageProps {
  username: string;
}

export const AuthPage = forwardRef<HTMLDivElement, AuthPageProps>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ({ username: _username }, ref) => {
    return (
      <div 
        ref={ref}
        className="fixed inset-0 flex flex-col items-center justify-center px-6 md:px-24"
        style={{ display: 'none', paddingTop: '40px' }}
      >
        <div className="max-w-2xl w-full px-6">
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
          
          <div className="auth-redirect my-8 border rounded p-6 text-center" style={{ borderColor: 'var(--accent-info)', opacity: 0 }}>
            <div className="text-lg font-medium mb-3" style={{ color: 'var(--accent-info)' }}>
              Redirecting to GitHub...
            </div>
            <div className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              https://github.com/login/oauth/authorize
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ color: 'var(--accent-info)' }}></div>
              <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ color: 'var(--accent-info)', animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ color: 'var(--accent-info)', animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

AuthPage.displayName = 'AuthPage';
