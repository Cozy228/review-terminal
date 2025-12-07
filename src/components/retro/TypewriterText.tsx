import clsx from 'clsx';
import { forwardRef, type ReactElement } from 'react';

interface TypewriterTextProps {
  className?: string;
  initialText?: string;
}

const parseHtmlText = (text: string) => {
  // Parse text with <span class="highlight-number"> tags
  const parts: (string | ReactElement)[] = [];
  const regex = /<span class="highlight-number">(.*?)<\/span>/g;
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // Add the highlighted number
    parts.push(
      <span key={`highlight-${keyIndex++}`} className="highlight-number">
        {match[1]}
      </span>
    );
    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
};

export const TypewriterText = forwardRef<HTMLSpanElement, TypewriterTextProps>(
  ({ className, initialText = '' }, ref) => {
    const content = parseHtmlText(initialText);

    return (
      <span ref={ref} className={clsx('mono', className)}>
        {content}
      </span>
    );
  }
);

TypewriterText.displayName = 'TypewriterText';
