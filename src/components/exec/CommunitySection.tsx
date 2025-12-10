import { useMemo } from 'react';
import type { Community } from '../../types/executive';
import { DataCardGroup } from '../retro/DataCardGroup';

interface CommunitySectionProps {
  data: Community;
}

export const CommunitySection: React.FC<CommunitySectionProps> = ({ data }) => {
  const cards = useMemo(() => [
    {
      title: 'SHARING EVENTS',
      value: data.sharingEvents.toString(),
      note: `${data.monthlyAvgSharingEvents.toFixed(1)}/month avg`,
      tone: 'purple' as const,
    },
    {
      title: 'MENTORED',
      value: data.peopleMentored.toString(),
      note: `${data.mentorshipRatio.toFixed(1)}% of team`,
      tone: 'blue' as const,
    },
    {
      title: 'BRAVO RECEIVED',
      value: data.bravoReceived.toString(),
      note: `${data.bravoGiven} given`,
      tone: 'gold' as const,
    },
  ], [data]);

  return (
    <DataCardGroup items={cards} className="community-cards" columns={3} />
  );
};
