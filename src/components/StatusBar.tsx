import { Heart } from 'lucide-react';
import type { TerminalStatus } from '../types';

interface StatusBarProps {
  status: TerminalStatus;
}

export const StatusBar: React.FC<StatusBarProps> = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'READY':
        return { color: 'var(--text-dim)' };
      case 'AUTHORIZING...':
        return { color: 'var(--accent-info)', fontWeight: 'bold' };
      case 'LOADING...':
        return { color: 'var(--accent-warning)', fontWeight: 'bold' };
      case 'PROCESSING...':
        return { color: 'var(--accent-info)', fontWeight: 'bold' };
      case 'EXPORTING...':
        return { color: 'var(--accent-warning)', fontWeight: 'bold' };
      case 'COMPLETE':
        return { color: 'var(--accent-success)', fontWeight: 'bold' };
      case 'ERROR':
        return { color: 'var(--accent-error)', fontWeight: 'bold' };
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
          className={status === 'AUTHORIZING...' || status === 'LOADING...' || status === 'PROCESSING...' || status === 'EXPORTING...' ? 'animate-pulse' : ''}
          style={getStatusStyle()}
        >
          {status}
        </span>
      </div>
    </div>
  );
};
