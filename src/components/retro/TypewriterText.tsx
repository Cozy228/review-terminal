import clsx from 'clsx';
import { forwardRef } from 'react';

interface TypewriterTextProps {
  className?: string;
  initialText?: string;
}

export const TypewriterText = forwardRef<HTMLSpanElement, TypewriterTextProps>(
  ({ className, initialText = '' }, ref) => {
    return (
      <span ref={ref} className={clsx('mono', className)}>
        {initialText}
      </span>
    );
  }
);

TypewriterText.displayName = 'TypewriterText';
