import type React from 'react';
import clsx from 'clsx';
import type { DataCardProps } from './DataCard';
import { DataCard } from './DataCard';

interface DataCardGroupProps {
  items: DataCardProps[];
  columns?: 2 | 3;
  className?: string;
}

export const DataCardGroup: React.FC<DataCardGroupProps> = ({ items, columns = 2, className }) => {
  const gridClass = columns === 3 ? 'grid-three' : 'grid-two';
  return (
    <div className={clsx('data-grid', gridClass, className)}>
      {items.map((item, index) => (
        <DataCard key={`${item.title}-${index}`} {...item} />
      ))}
    </div>
  );
};
