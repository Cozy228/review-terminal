import { forwardRef, useImperativeHandle, useRef } from 'react';
import clsx from 'clsx';
import type { ContributionGridData } from '../../types';

export interface ContributionGridRefs {
  blocks: HTMLDivElement[];
  labels: HTMLDivElement[];
}

export interface ContributionGridProps {
  data: ContributionGridData;
  className?: string;
}

export const ContributionGrid = forwardRef<ContributionGridRefs, ContributionGridProps>(
  ({ data, className }, ref) => {
    // Refs for GSAP animations
    const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
    const labelRefs = useRef<(HTMLDivElement | null)[]>([]);

    // Expose refs to parent for GSAP animations
    useImperativeHandle(ref, () => ({
      blocks: blockRefs.current.filter(Boolean) as HTMLDivElement[],
      labels: labelRefs.current.filter(Boolean) as HTMLDivElement[],
    }));

    if (!data.months.length) return null;

    return (
      <div className={clsx('contribution-grid', className)}>
        {data.months.map((monthData, index) => (
          <div
            key={`${monthData.month}-${monthData.date}`}
            className="contrib-month"
            data-count={monthData.count}
            data-month={monthData.month}
          >
            <div
              ref={(el) => (blockRefs.current[index] = el)}
              className={clsx('contrib-block', `level-${monthData.level}`)}
              title={`${monthData.month}: ${monthData.count} commits`}
              data-level={monthData.level}
              data-count={monthData.count}
            >
              <span className="contrib-count">{monthData.count}</span>
            </div>
            <div
              ref={(el) => (labelRefs.current[index] = el)}
              className="contrib-label"
            >
              {monthData.month}
            </div>
          </div>
        ))}
      </div>
    );
  }
);

ContributionGrid.displayName = 'ContributionGrid';
