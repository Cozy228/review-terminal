import type { CopilotData } from '../types';
import { generateProgressBar } from '../utils/ascii';

type Tone = 'green' | 'gold' | 'blue' | 'red' | 'purple';

interface StatCard {
  title: string;
  value: string;
  note?: string;
  tone?: Tone;
}

interface AcceptanceBar {
  label: string;
  percent: number;
  bar: string;
  tone: Tone;
}

export class CopilotAdapter {
  static toStatCards(data: CopilotData): StatCard[] {
    return [
      {
        title: 'ACCEPTANCE RATE',
        value: `${data.acceptanceRate}%`,
        note: 'AI suggestions locked in.',
        tone: data.acceptanceRate >= 60 ? 'green' : data.acceptanceRate >= 40 ? 'gold' : 'red'
      },
      {
        title: 'SUGGESTIONS ACCEPTED',
        value: data.suggestionsAccepted.toLocaleString(),
        note: 'Code generation on point.',
        tone: 'purple'
      },
      {
        title: 'LINES GENERATED',
        value: data.linesGenerated.toLocaleString(),
        note: 'AI-powered velocity.',
        tone: 'blue'
      },
      {
        title: 'TIME SAVED',
        value: data.timesSaved,
        note: `Active ${data.activeDays} days`,
        tone: 'gold'
      }
    ];
  }

  static toAcceptanceBar(data: CopilotData): AcceptanceBar {
    return {
      label: 'Acceptance Rate',
      percent: data.acceptanceRate,
      bar: generateProgressBar(data.acceptanceRate, 45),
      tone: data.acceptanceRate >= 60 ? 'green' : data.acceptanceRate >= 40 ? 'gold' : 'red'
    };
  }

  static toNarrative(data: CopilotData): string {
    const quality = data.acceptanceRate >= 70 ? 'POWER USER' : data.acceptanceRate >= 50 ? 'EFFICIENT' : 'EXPERIMENTAL';
    return `${quality} AI pairing: ${data.acceptanceRate}% acceptance, ${data.suggestionsAccepted.toLocaleString()} suggestions, ${data.linesGenerated.toLocaleString()} lines generated, saved ${data.timesSaved}.`;
  }
}
