import { forwardRef } from 'react';

interface AuthPageProps {
  username: string;
  role: string;
}

export const AuthPage = forwardRef<HTMLDivElement, AuthPageProps>(
  ({ username, role }, ref) => {
    return (
      <div 
        ref={ref}
        className="fixed inset-0 flex flex-col items-center justify-center"
        style={{ display: 'none', opacity: 0 }}
      >
        <div className="max-w-2xl w-full px-6">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4 mb-3">
              <span className={`auth-line-${i}`} style={{ color: 'var(--text-primary)' }}></span>
              <span className={`auth-check-${i}`} style={{ opacity: 0, color: 'var(--accent-success)' }}>[✓]</span>
            </div>
          ))}
          <div className="auth-session my-8 border-t border-b py-6" style={{ borderColor: 'var(--border-subtle)', opacity: 0 }}>
            <div className="text-center font-medium text-lg" style={{ color: 'var(--text-primary)' }}>
              SESSION ESTABLISHED
            </div>
            <div className="text-center mt-2" style={{ color: 'var(--text-secondary)' }}>
              User: @{username} | Role: {role} | Access: Full
            </div>
          </div>
          <div className="auth-countdown" style={{ color: 'var(--text-dim)', opacity: 0 }}>
            &gt; Starting build process in 3... 2... 1...
          </div>
        </div>
      </div>
    );
  }
);

AuthPage.displayName = 'AuthPage';
