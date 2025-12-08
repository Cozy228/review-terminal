import type { TechStackData } from '../types';
import { generateProgressBar } from '../utils/ascii';

type Tone = 'green' | 'gold' | 'blue' | 'red' | 'purple' | 'pink' | 'orange';

interface LanguageBar {
  label: string;
  percent: number;
  bar: string;
  tone?: Tone;
}

interface FrameworkBar {
  label: string;
  hours: number;
  bar: string;
  percent: number;
  tone?: Tone;
}

interface LevelingStat {
  label: string;
  level: string;
  percent: number;
  bar: string;
  tone?: Tone;
}

export class StackAdapter {
  static toHorizontalBars(data: TechStackData): string {
    const lines: string[] = [];
    const maxBarLength = 50;
    
    lines.push('Language Distribution');
    lines.push('');
    
    data.languages.forEach(lang => {
      const barLength = Math.round((lang.percentage / 100) * maxBarLength);
      const bar = '█'.repeat(barLength) + '░'.repeat(maxBarLength - barLength);
      const line = `  ${lang.name.padEnd(12)} ${bar} ${lang.percentage}%`;
      lines.push(line);
    });
    
    return lines.join('\n');
  }

  static toFrameworkBars(data: TechStackData): string {
    const lines: string[] = [];
    const maxHours = Math.max(...data.frameworks.map(f => f.hours));
    const maxBarLength = 40;
    
    lines.push('');
    lines.push('Most Active Frameworks');
    lines.push('');
    
    data.frameworks.forEach(framework => {
      const barLength = Math.round((framework.hours / maxHours) * maxBarLength);
      const bar = '█'.repeat(barLength) + '░'.repeat(maxBarLength - barLength);
      const line = `  ${framework.name.padEnd(10)} ${bar} ${framework.hours.toLocaleString()}h`;
      lines.push(line);
    });
    
    return lines.join('\n');
  }

  static toLanguageBars(data: TechStackData): LanguageBar[] {
    return data.languages.map((lang) => {
      const percent = Math.round(lang.percentage);

      // Color based on percentage - higher percentage = more prestigious color
      let tone: Tone;
      if (percent >= 40) {
        tone = 'gold'; // Dominant language
      } else if (percent >= 25) {
        tone = 'purple'; // Significant usage
      } else if (percent >= 15) {
        tone = 'blue'; // Good presence
      } else if (percent >= 8) {
        tone = 'pink'; // Moderate usage
      } else {
        tone = 'green'; // Minor usage
      }

      return {
        label: lang.name,
        percent,
        bar: generateProgressBar(percent, 80),
        tone,
      };
    });
  }

  static toFrameworkUsage(data: TechStackData): FrameworkBar[] {
    // Color based on usage ranking - most used gets best color
    const getRankColor = (rank: number): Tone => {
      switch (rank) {
        case 0: return 'gold';    // #1 most used
        case 1: return 'purple';  // #2
        case 2: return 'blue';    // #3
        case 3: return 'pink';    // #4
        case 4: return 'green';   // #5
        default: return 'green';  // #6+
      }
    };

    const maxHours = Math.max(...data.frameworks.map((f) => f.hours), 1);
    return data.frameworks.map((framework, index) => {
      const percent = Math.round((framework.hours / maxHours) * 100);
      return {
        label: framework.name,
        hours: framework.hours,
        percent,
        bar: generateProgressBar(percent, 80),
        tone: getRankColor(index),
      };
    });
  }

  static toLevelingUp(_: TechStackData, learningData?: import('../types').LearningData): LevelingStat[] {
    // If no learning data, return empty array
    if (!learningData) {
      return [];
    }

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

    return learningData.skills.map((skill) => {
      const percent = levelToPercent(skill.level);
      return {
        label: skill.name,
        level: skill.level.toUpperCase(),
        percent,
        bar: generateProgressBar(percent, 80),
        tone: levelToTone(skill.level)
      };
    });
  }
}
