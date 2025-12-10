import { useMemo } from 'react';
import type { TeamBasicsData } from '../../types/executive';
import { BasicsAdapter } from '../../adapters/ExecutiveAdapter';
import { DataCardGroup } from '../retro/DataCardGroup';

interface BasicsSectionProps {
  data: TeamBasicsData;
  ctoName?: string;
  ctoTitle?: string;
}

export const BasicsSection: React.FC<BasicsSectionProps> = ({ data, ctoName, ctoTitle }) => {
  const cards = useMemo(() => {
    const baseCards = BasicsAdapter.toStatCards(data);

    // Add CTO card at the beginning if provided
    if (ctoName && ctoTitle) {
      return [
        {
          title: 'CTO',
          value: ctoName,
          note: ctoTitle,
          tone: 'blue' as const,
        },
        ...baseCards,
      ];
    }

    return baseCards;
  }, [data, ctoName, ctoTitle]);

  return (
    <DataCardGroup items={cards} className="basics-cards" columns={4} />
  );
};
