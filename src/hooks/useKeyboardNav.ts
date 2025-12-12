import { useEffect } from 'react';
import type { AnimationPhase } from '../types';

export interface UseKeyboardNavOptions {
  phase: AnimationPhase;
  isExecutiveMode: boolean;
  isAuthEnabled: boolean;
  startAuthFlow: () => void;
  handleAuthComplete: (user?: string | null) => void;
  startDataTimeline: (isReplay?: boolean) => void;
  replayExecAnimation: () => void;
  resetToIdle: () => void;
}

export function useKeyboardNav({
  phase,
  isExecutiveMode,
  isAuthEnabled,
  startAuthFlow,
  handleAuthComplete,
  startDataTimeline,
  replayExecAnimation,
  resetToIdle,
}: UseKeyboardNavOptions) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const isExecutiveRoute = window.location.pathname === '/executive';
      if (isExecutiveRoute && !isExecutiveMode) {
        return;
      }

      if (phase === 'idle' && !isExecutiveMode) {
        if (e.key === 'Enter' || e.key === ' ') {
          if (isAuthEnabled) {
            startAuthFlow();
          } else {
            handleAuthComplete(null);
          }
        }
      } else if (phase === 'summary') {
        if (e.key === 'r' || e.key === 'R') {
          if (isExecutiveMode) {
            replayExecAnimation();
          } else {
            startDataTimeline(true);
          }
        } else if (e.key === 'Escape' || e.key === 'b' || e.key === 'B') {
          resetToIdle();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    phase,
    isExecutiveMode,
    isAuthEnabled,
    startAuthFlow,
    handleAuthComplete,
    replayExecAnimation,
    resetToIdle,
    startDataTimeline,
  ]);
}
