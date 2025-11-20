import { forwardRef } from 'react';
import { 
  ASCII_STATESTREET,
  ASCII_DEVELOPER,
  ASCII_ANNUAL_REVIEW,
  ASCII_2025
} from '../constants/ascii-art';

interface IdlePageProps {
  cursorRef: React.RefObject<HTMLSpanElement | null>;
}

export const IdlePage = forwardRef<HTMLDivElement, IdlePageProps>(
  ({ cursorRef }, ref) => {
    return (
      <div 
        ref={ref}
        className="fixed inset-0 flex flex-col items-center justify-center"
        style={{ display: 'flex' }}
      >
        <div className="text-center mb-8 -mt-20">
          <pre className="idle-title-1 mb-3" style={{ fontSize: '0.75rem', color: 'var(--accent-info)' }}>
            {ASCII_STATESTREET}
          </pre>
          <pre className="idle-title-2 mb-3" style={{ fontSize: '0.7rem', color: 'var(--accent-success)' }}>
            {ASCII_DEVELOPER}
          </pre>
          <pre className="idle-title-3 mb-3" style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
            {ASCII_ANNUAL_REVIEW}
          </pre>
          <pre className="idle-title-4 mb-6" style={{ fontSize: '0.5rem', color: 'var(--accent-highlight)' }}>
            {ASCII_2025}
          </pre>
        </div>
        <div className="idle-prompt flex items-baseline gap-2 text-base font-mono" style={{ color: 'var(--text-primary)' }}>
          <span>[ Press ENTER to Initialize System ]</span>
          <span ref={cursorRef} style={{ display: 'inline-block', verticalAlign: 'baseline', transform: 'translateY(-0.1em)' }}>▌</span>
        </div>
      </div>
    );
  }
);

IdlePage.displayName = 'IdlePage';
