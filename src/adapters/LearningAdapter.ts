import type { LearningData } from '../types';
import { generateProgressBar } from '../utils/ascii';

type Tone = 'green' | 'gold' | 'blue' | 'red' | 'purple';

interface StatCard {
  title: string;
  value: string;
  note?: string;
  tone?: Tone;
}

interface LevelingStat {
  label: string;
  level: string;
  percent: number;
  bar: string;
  tone?: Tone;
}

export class LearningAdapter {
  static toStatCards(data: LearningData): StatCard[] {
    return [
      {
        title: 'COURSES COMPLETED',
        value: data.coursesCompleted.toString(),
        note: 'Knowledge acquired.',
        tone: 'blue'
      },
      {
        title: 'CERTIFICATIONS',
        value: data.certificationsEarned.toString(),
        note: 'Badges of honor.',
        tone: 'gold'
      },
      {
        title: 'LEARNING HOURS',
        value: `${data.hoursLearning}h`,
        note: 'Continuous growth.',
        tone: 'green'
      },
      {
        title: 'SKILL AREAS',
        value: data.skills.length.toString(),
        note: 'Multi-faceted expertise.',
        tone: 'purple'
      }
    ];
  }

  static toSkillBars(data: LearningData): LevelingStat[] {
    const levelToPercent = (level: string): number => {
      switch (level.toLowerCase()) {
        case 'expert':
          return 95;
        case 'advanced':
          return 80;
        case 'intermediate':
          return 60;
        case 'beginner':
          return 35;
        default:
          return 50;
      }
    };

    const levelToTone = (level: string): Tone => {
      switch (level.toLowerCase()) {
        case 'expert':
          return 'gold';
        case 'advanced':
          return 'purple';
        case 'intermediate':
          return 'blue';
        case 'beginner':
          return 'green';
        default:
          return 'green';
      }
    };

    return data.skills.map((skill) => {
      const percent = levelToPercent(skill.level);
      return {
        label: skill.name,
        level: skill.level.toUpperCase(),
        percent,
        bar: generateProgressBar(percent, 45),
        tone: levelToTone(skill.level)
      };
    });
  }

  static toNarrative(data: LearningData): string {
    const expertSkills = data.skills.filter(s => s.level === 'expert').length;
    const advancedSkills = data.skills.filter(s => s.level === 'advanced').length;
    return `Learning journey: ${data.coursesCompleted} courses, ${data.certificationsEarned} certs, ${data.hoursLearning}h invested. ${expertSkills} expert + ${advancedSkills} advanced skills.`;
  }
}
