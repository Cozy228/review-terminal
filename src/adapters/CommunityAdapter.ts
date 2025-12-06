import type { CommunityData } from '../types';

type Tone = 'green' | 'gold' | 'blue' | 'red';

interface StatCard {
  title: string;
  value: string;
  note?: string;
  tone?: Tone;
}

interface ActivityItem {
  icon: string;
  name: string;
  date: string;
  type: string;
}

export class CommunityAdapter {
  static toStatCards(data: CommunityData): StatCard[] {
    const bravoBalance = data.bravosGiven - data.bravosReceived;
    const isGiver = bravoBalance > 0;

    return [
      {
        title: 'BRAVOS RECEIVED',
        value: data.bravosReceived.toString(),
        note: 'Recognition earned.',
        tone: 'gold'
      },
      {
        title: 'BRAVOS GIVEN',
        value: data.bravosGiven.toString(),
        note: isGiver ? 'Team cheerleader!' : 'Generous spirit.',
        tone: 'green'
      },
      {
        title: 'EVENTS',
        value: data.activities.length.toString(),
        note: 'Community presence.',
        tone: 'blue'
      },
      {
        title: 'IMPACT SCORE',
        value: Math.round((data.bravosReceived + data.bravosGiven + data.activities.length * 5) / 3).toString(),
        note: 'Culture contributor.',
        tone: 'gold'
      }
    ];
  }

  static toActivityList(data: CommunityData): ActivityItem[] {
    const typeToIcon = (type: string): string => {
      switch (type) {
        case 'tech-talk':
          return '🎤';
        case 'hackathon':
          return '⚡';
        case 'session':
          return '📚';
        default:
          return '✨';
      }
    };

    return data.activities.map((activity) => ({
      icon: typeToIcon(activity.type),
      name: activity.name,
      date: activity.date,
      type: activity.type
    }));
  }

  static toNarrative(data: CommunityData): string {
    const totalBravos = data.bravosReceived + data.bravosGiven;
    const quality = totalBravos > 80 ? 'CULTURE CHAMPION' : totalBravos > 40 ? 'TEAM PLAYER' : 'CONTRIBUTOR';
    return `${quality}: ${data.bravosReceived} bravos earned, ${data.bravosGiven} given, ${data.activities.length} community events.`;
  }
}
