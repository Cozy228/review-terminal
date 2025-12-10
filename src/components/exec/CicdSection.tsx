import { useMemo } from 'react';
import clsx from 'clsx';
import type { TeamCICDData } from '../../types/executive';
import { TeamCICDAdapter } from '../../adapters/ExecutiveAdapter';
import { DataCardGroup } from '../retro/DataCardGroup';
import { TypewriterText } from '../retro/TypewriterText';

interface CicdSectionProps {
  data: TeamCICDData;
}

export const CicdSection: React.FC<CicdSectionProps> = ({ data }) => {
  const cards = useMemo(() => TeamCICDAdapter.toStatCards(data), [data]);
  const buildBar = useMemo(() => TeamCICDAdapter.toBuildSuccessBar(data), [data]);
  const narrative = useMemo(() => TeamCICDAdapter.toNarrative(data), [data]);

  return (
    <>
      <DataCardGroup items={cards} className="cicd-cards mb-4" columns={2} />

      <div className="retro-card is-gold">
        <div className="retro-card-title">BUILD SUCCESS RATE</div>
        <div className="stat-row">
          <span className="label">{buildBar.label}</span>
          <span
            className={clsx('mono spark build-success-bar', buildBar.tone ? `tone-${buildBar.tone}` : null)}
            data-percent={buildBar.percent}
            data-bar={buildBar.bar}
          >
            {buildBar.bar}
          </span>
          <span className="value">{buildBar.percent}%</span>
        </div>
        <TypewriterText className="retro-card-note cicd-narrative mt-2" initialText={narrative} />
      </div>
    </>
  );
};
