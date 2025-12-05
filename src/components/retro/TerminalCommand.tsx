import clsx from 'clsx';
import { forwardRef } from 'react';

interface TerminalCommandProps {
  text: string;
  className?: string;
  showCaret?: boolean;
}

export const TerminalCommand = forwardRef<HTMLDivElement, TerminalCommandProps>(
  ({ text, className, showCaret = true }, ref) => {
    return (
      <div ref={ref} className={clsx('command-line', className)} data-active="true">
        <span className="command-text">{text}</span>
        {showCaret && <span className="command-caret" />}
      </div>
    );
  }
);

TerminalCommand.displayName = 'TerminalCommand';
