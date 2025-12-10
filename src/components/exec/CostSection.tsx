import { useMemo } from 'react';
import clsx from 'clsx';
import type { TeamAIData } from '../../types/executive';
import { AIAdapter } from '../../adapters/ExecutiveAdapter';
import { DataCardGroup } from '../retro/DataCardGroup';

interface CostSectionProps {
  data: TeamAIData;
}

export const CostSection: React.FC<CostSectionProps> = ({ data }) => {
  const cards = useMemo(() => {
    const baseCards = AIAdapter.toStatCards(data);
    let tone: 'green' | 'gold' | 'red';
    if (data.acceptanceRate >= 70) {
      tone = 'green';
    } else if (data.acceptanceRate >= 60) {
      tone = 'gold';
    } else {
      tone = 'red';
    }
    // Replace Quality Grade card with Acceptance Rate
    return [
      baseCards[0], // Active Users
      baseCards[1], // Active Days
      baseCards[2], // Code Lines
      {
        title: 'ACCEPTANCE RATE',
        value: `${data.acceptanceRate}%`,
        note: 'AI code acceptance',
        tone,
      },
    ];
  }, [data]);

  const adoptionBar = useMemo(() => AIAdapter.toAdoptionBar(data), [data]);
  const acceptanceRateBar = useMemo(() => AIAdapter.toAcceptanceBar(data), [data]);

  return (
    <>
      <DataCardGroup items={cards} className="ai-cards mb-4" columns={4} />

      <div className="retro-card is-purple mb-4">
        <div className="retro-card-title">AI ADOPTION</div>
        <div className="stat-row">
          <span className="label">{adoptionBar.label}</span>
          <span
            className={clsx('mono spark ai-adoption-bar', adoptionBar.tone ? `tone-${adoptionBar.tone}` : null)}
            data-percent={adoptionBar.percent}
            data-bar={adoptionBar.bar}
          >
            {adoptionBar.bar}
          </span>
          <span className="value">{adoptionBar.percent}%</span>
        </div>
      </div>

      <div className="retro-card is-gold">
        <div className="retro-card-title">CODE ACCEPTANCE</div>
        <div className="stat-row">
          <span className="label">{acceptanceRateBar.label}</span>
          <span
            className={clsx('mono spark acceptance-bar', `tone-${acceptanceRateBar.tone}`)}
            data-percent={acceptanceRateBar.percent}
            data-bar={acceptanceRateBar.bar}
          >
            {acceptanceRateBar.bar}
          </span>
          <span className="value">{acceptanceRateBar.percent}%</span>
        </div>
      </div>
    </>
  );
};
