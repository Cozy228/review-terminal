import { useState } from 'react';

interface WindowChromeProps {
  username: string;
}

export const WindowChrome = ({ username }: WindowChromeProps) => {
  const [hoveredButton, setHoveredButton] = useState<'close' | 'minimize' | 'maximize' | null>(null);

  return (
    <div 
      className="window-chrome fixed top-0 left-0 right-0 z-50 flex items-center px-4 py-3"
      style={{ 
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        height: '40px'
      }}
    >
      {/* macOS Traffic Lights */}
      <div className="flex items-center gap-2">
        {/* Close Button */}
        <button
          className="window-button relative flex items-center justify-center"
          onMouseEnter={() => setHoveredButton('close')}
          onMouseLeave={() => setHoveredButton(null)}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#ff5f57',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {hoveredButton === 'close' && (
            <span style={{ 
              fontSize: '10px', 
              color: '#4d0000',
              fontWeight: 'bold',
              lineHeight: 1
            }}>×</span>
          )}
        </button>

        {/* Minimize Button */}
        <button
          className="window-button relative flex items-center justify-center"
          onMouseEnter={() => setHoveredButton('minimize')}
          onMouseLeave={() => setHoveredButton(null)}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#febc2e',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {hoveredButton === 'minimize' && (
            <span style={{ 
              fontSize: '10px', 
              color: '#6b4d00',
              fontWeight: 'bold',
              lineHeight: 1
            }}>−</span>
          )}
        </button>

        {/* Maximize Button */}
        <button
          className="window-button relative flex items-center justify-center"
          onMouseEnter={() => setHoveredButton('maximize')}
          onMouseLeave={() => setHoveredButton(null)}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#28c840',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {hoveredButton === 'maximize' && (
            <span style={{ 
              fontSize: '10px', 
              color: '#004d0d',
              fontWeight: 'bold',
              lineHeight: 1
            }}>+</span>
          )}
        </button>
      </div>

      {/* Title Bar */}
      <div 
        className="flex-1 text-center"
        style={{ 
          color: 'var(--text-secondary)',
          fontSize: '13px',
          userSelect: 'none'
        }}
      >
        {username}@2025-review:~
      </div>

      {/* Spacer for symmetry */}
      <div style={{ width: '60px' }} />
    </div>
  );
};
