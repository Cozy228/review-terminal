import { Heart, Sun, Moon } from 'lucide-react';
import type { TerminalStatus } from '../types';
import type { Theme } from '../hooks/useTheme';

interface StatusBarProps {
  status: TerminalStatus;
  theme: Theme;
  onToggleTheme: () => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({ status, theme, onToggleTheme }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'IDLE':
        return { color: 'var(--text-dim)' };
      case 'BUILDING...':
        return { color: 'var(--accent-info)', fontWeight: 'bold' };
      case 'COMPLETE':
        return { color: 'var(--accent-success)', fontWeight: 'bold' };
      default:
        return { color: 'var(--text-primary)' };
    }
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 px-6 py-3 flex items-center justify-between text-sm border-t"
      style={{ 
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-subtle)',
        color: 'var(--text-secondary)',
        zIndex: 1000
      }}
    >
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1 whitespace-nowrap">
          <span>Made with</span>
          <Heart className="animate-pulse inline-block" size={14} fill="var(--accent-error)" style={{ color: 'var(--accent-error)' }} />
          <span>by developers for developers</span>
        </span>
      </div>
      
      <div className="flex items-center gap-6">
        <span 
          className={status === 'BUILDING...' ? 'animate-pulse' : ''}
          style={getStatusStyle()}
        >
          {status}
        </span>
        <button
          onClick={onToggleTheme}
          className="hover:opacity-80 transition-opacity flex items-center gap-2"
          style={{ color: 'var(--text-primary)' }}
        >
          <span className="flex items-center gap-1" style={{ opacity: theme === 'light' ? 1 : 0.5 }}>
            <Sun size={14} /> Light
          </span>
          <span style={{ color: 'var(--text-dim)' }}>/</span>
          <span className="flex items-center gap-1" style={{ opacity: theme === 'dark' ? 1 : 0.5 }}>
            <Moon size={14} /> Dark
          </span>
        </button>
      </div>
    </div>
  );
};
