import type React from 'react';
import clsx from 'clsx';

export type CardTone = 'green' | 'gold' | 'blue' | 'red';

export interface DataCardProps {
  title: string;
  value: string | number;
  note?: string;
  tone?: CardTone;
  className?: string;
}

export const DataCard: React.FC<DataCardProps> = ({ title, value, note, tone = 'green', className }) => {
  return (
    <div className={clsx('retro-card', tone ? `is-${tone}` : null, className)}>
      <div className="retro-card-title">{title}</div>
      <div className="retro-card-value mono">{value}</div>
      {note ? <div className="retro-card-note">{note}</div> : <div className="retro-card-note" />}
    </div>
  );
};
