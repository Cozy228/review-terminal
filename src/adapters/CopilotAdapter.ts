import type { CopilotData } from '../types';
import { generateProgressBar } from '../utils/ascii';

type Tone = 'green' | 'gold' | 'blue' | 'red' | 'purple' | 'pink' | 'orange';

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
        note: 'Perfect human-robot synergy achieved',
        tone: data.acceptanceRate >= 60 ? 'green' : data.acceptanceRate >= 40 ? 'gold' : 'red'
      },
      {
        title: 'SUGGESTIONS ACCEPTED',
        value: data.suggestionsAccepted.toLocaleString(),
        note: 'AI wisdom powering productivity',
        tone: 'purple'
      },
      {
        title: 'LINES GENERATED',
        value: data.linesGenerated.toLocaleString(),
        note: 'AI sidekick teamwork at its finest',
        tone: 'blue'
      },
      {
        title: 'TIME SAVED',
        value: data.timesSaved,
        note: `Active ${data.activeDays} days - coffee breaks saved`,
        tone: 'gold'
      }
    ];
  }

  static toAcceptanceBar(data: CopilotData): AcceptanceBar {
    // Use varied colors instead of just green for high performance
    let tone: Tone;
    if (data.acceptanceRate >= 80) {
      tone = 'pink'; // Exceptional AI synergy
    } else if (data.acceptanceRate >= 65) {
      tone = 'purple'; // Great AI pairing
    } else if (data.acceptanceRate >= 50) {
      tone = 'blue'; // Good acceptance
    } else if (data.acceptanceRate >= 35) {
      tone = 'gold'; // Moderate acceptance
    } else {
      tone = 'orange'; // Experimental phase
    }

    return {
      label: 'Acceptance Rate',
      percent: data.acceptanceRate,
      bar: generateProgressBar(data.acceptanceRate, 80),
      tone
    };
  }

  static toNarrative(data: CopilotData): string {
    const quality = data.acceptanceRate >= 80 ? 'POWER USER' : data.acceptanceRate >= 50 ? 'EFFICIENT' : 'EXPERIMENTAL';
    return `${quality} AI pairing: <span class="highlight-number">${data.acceptanceRate}%</span> acceptance, <span class="highlight-number">${data.suggestionsAccepted.toLocaleString()}</span> suggestions, <span class="highlight-number">${data.linesGenerated.toLocaleString()}</span> lines generated, saved <span class="highlight-number">${data.timesSaved}</span>.`;
  }
}
