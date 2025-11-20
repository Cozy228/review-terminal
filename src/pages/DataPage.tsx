import { forwardRef } from 'react';
import { 
  ASCII_GIT, 
  ASCII_STACK, 
  ASCII_FLOW, 
  ASCII_2025,
  ASCII_BADGE 
} from '../constants/ascii-art';

interface DataPageProps {
  gitChart: string;
  gitStats: string[];
  stackBars: string;
  stackFrameworks: string;
  flowHeatmap: string;
  flowStats: string[];
  showMenu: boolean;
  onReplay: () => void;
}

export const DataPage = forwardRef<HTMLDivElement, DataPageProps>(
  ({ gitChart, gitStats, stackBars, stackFrameworks, flowHeatmap, flowStats, showMenu, onReplay }, ref) => {
    return (
      <div 
        ref={ref}
        className="fixed inset-0 overflow-y-auto px-6 md:px-24 py-8 md:py-12"
        style={{ display: 'none', paddingBottom: '4rem' }}
      >
        {/* Git Module */}
        <div className="git-module max-w-4xl mx-auto mb-16" style={{ opacity: 0, visibility: 'hidden' }}>
          <pre className="git-title mb-6" style={{ color: 'var(--accent-info)' }}>
            {ASCII_GIT}
          </pre>
          <div className="flex items-center gap-4 mb-2">
            <span className="git-log-0" style={{ color: 'var(--text-primary)' }}></span>
            <span className="git-check-0" style={{ opacity: 0, color: 'var(--accent-success)' }}>[✓]</span>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <span className="git-log-1" style={{ color: 'var(--text-primary)' }}></span>
            <span className="git-check-1" style={{ opacity: 0, color: 'var(--accent-success)' }}>[✓]</span>
          </div>
          <pre className="git-chart mb-6" style={{ color: 'var(--text-secondary)' }}>
            {gitChart}
          </pre>
          <div className="git-stats">
            {gitStats.map((stat, i) => (
              <div key={i} className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                {stat}
              </div>
            ))}
          </div>
        </div>

        {/* Stack Module */}
        <div className="stack-module max-w-4xl mx-auto mb-16" style={{ opacity: 0, visibility: 'hidden' }}>
          <pre className="stack-title mb-6" style={{ color: 'var(--accent-success)' }}>
            {ASCII_STACK}
          </pre>
          <div className="flex items-center gap-4 mb-2">
            <span className="stack-log-0" style={{ color: 'var(--text-primary)' }}></span>
            <span className="stack-check-0" style={{ opacity: 0, color: 'var(--accent-success)' }}>[✓]</span>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <span className="stack-log-1" style={{ color: 'var(--text-primary)' }}></span>
            <span className="stack-check-1" style={{ opacity: 0, color: 'var(--accent-success)' }}>[✓]</span>
          </div>
          <pre className="stack-bars mb-6" style={{ color: 'var(--text-secondary)' }}>
            {stackBars}
            {stackFrameworks}
          </pre>
        </div>

        {/* Flow Module */}
        <div className="flow-module max-w-4xl mx-auto mb-16" style={{ opacity: 0, visibility: 'hidden' }}>
          <pre className="flow-title mb-6" style={{ color: 'var(--accent-highlight)' }}>
            {ASCII_FLOW}
          </pre>
          <div className="flex items-center gap-4 mb-2">
            <span className="flow-log-0" style={{ color: 'var(--text-primary)' }}></span>
            <span className="flow-check-0" style={{ opacity: 0, color: 'var(--accent-success)' }}>[✓]</span>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <span className="flow-log-1" style={{ color: 'var(--text-primary)' }}></span>
            <span className="flow-check-1" style={{ opacity: 0, color: 'var(--accent-success)' }}>[✓]</span>
          </div>
          <pre className="flow-heatmap mb-6" style={{ color: 'var(--text-secondary)' }}>
            {flowHeatmap}
          </pre>
          <div className="flow-stats">
            {flowStats.map((stat, i) => (
              <div key={i} className="mb-2" style={{ color: 'var(--text-secondary)' }}>
                {stat}
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="summary-module max-w-4xl mx-auto flex flex-col items-center" style={{ opacity: 0, visibility: 'hidden' }}>
          <pre className="summary-title mb-8" style={{ color: 'var(--accent-info)' }}>
            {ASCII_2025}
          </pre>
          <pre className="summary-badge mb-8" style={{ color: 'var(--accent-highlight)' }}>
            {ASCII_BADGE}
          </pre>
          <div className="summary-message w-full border-t border-b py-6 mb-8 text-center" style={{ borderColor: 'var(--border-subtle)' }}>
            <div className="text-xl font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              BUILD SUCCESSFUL IN 365 DAYS
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              ALL TESTS PASSED  |  ZERO CRITICAL ISSUES
            </div>
          </div>
          {showMenu && (
            <div className="summary-menu border rounded px-8 py-4" style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-secondary)' }}>
              <span className="cursor-pointer hover:text-info" onClick={onReplay}>[R]eplay</span>
              <span className="mx-4">|</span>
              <span className="cursor-pointer hover:text-info">[D]ownload PDF</span>
              <span className="mx-4">|</span>
              <span className="cursor-pointer hover:text-info">[S]hare to Engage</span>
            </div>
          )}
          <div className="mt-8" style={{ color: 'var(--text-dim)' }}>
            &gt; <span className="animate-pulse">_</span>
          </div>
        </div>
      </div>
    );
  }
);

DataPage.displayName = 'DataPage';
