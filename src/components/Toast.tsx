import clsx from 'clsx';
import type React from 'react';

export type ToastTone = 'info' | 'success' | 'error';

export type ToastState = {
  message: string;
  tone: ToastTone;
};

interface ToastProps extends ToastState {
  onClose: () => void;
}

const toneStyles: Record<ToastTone, { borderColor: string; textColor: string }> = {
  info: { borderColor: 'var(--accent-info)', textColor: 'var(--text-primary)' },
  success: { borderColor: 'var(--accent-success)', textColor: 'var(--text-primary)' },
  error: { borderColor: 'var(--accent-error)', textColor: 'var(--text-primary)' },
};

export const Toast: React.FC<ToastProps> = ({ message, tone, onClose }) => {
  const style = toneStyles[tone];

  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        'fixed left-1/2 top-5 -translate-x-1/2 z-[1200] px-4 py-3 text-sm',
        'border-2 shadow-lg'
      )}
      style={{
        backgroundColor: 'rgba(20,25,37,0.92)',
        borderColor: style.borderColor,
        color: style.textColor,
        maxWidth: 'min(520px, calc(100vw - 32px))',
        pointerEvents: 'auto',
      }}
      onClick={onClose}
    >
      <span>{message}</span>
    </div>
  );
};

