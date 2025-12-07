import type { CICDData } from '../types';
import { generateProgressBar } from '../utils/ascii';

type Tone = 'green' | 'gold' | 'blue' | 'red';

interface StatCard {
  title: string;
  value: string;
  note?: string;
  tone?: Tone;
}

export class CICDAdapter {
  static toStatCards(data: CICDData): StatCard[] {
    const successRate = data.builds.total > 0
      ? Math.round((data.builds.successful / data.builds.total) * 100)
      : 0;

    return [
      {
        title: 'BUILD SUCCESS',
        value: `${successRate}%`,
        note: `${data.builds.successful}/${data.builds.total} builds passed`,
        tone: successRate >= 90 ? 'green' : successRate >= 75 ? 'gold' : 'red'
      },
      {
        title: 'DEPLOYMENTS',
        value: data.deployments.total.toString(),
        note: `Shipped ${data.deployments.production} times to prod`,
        tone: 'blue'
      },
      {
        title: 'AVG BUILD TIME',
        value: data.avgBuildTime,
        note: 'Lightning fast builds',
        tone: 'gold'
      },
      {
        title: 'PIPELINES',
        value: data.pipelinesConfigured.toString(),
        note: 'Automation unlocked',
        tone: 'green'
      }
    ];
  }

  static toBuildSuccessBar(data: CICDData): { label: string; percent: number; bar: string; tone: Tone } {
    const successRate = data.builds.total > 0
      ? Math.round((data.builds.successful / data.builds.total) * 100)
      : 0;

    return {
      label: 'Build Success Rate',
      percent: successRate,
      bar: generateProgressBar(successRate, 80),
      tone: successRate >= 90 ? 'green' : successRate >= 75 ? 'gold' : 'red'
    };
  }

  static toNarrative(data: CICDData): string {
    const successRate = data.builds.total > 0
      ? Math.round((data.builds.successful / data.builds.total) * 100)
      : 0;

    const quality = successRate >= 95 ? 'ELITE' : successRate >= 85 ? 'SOLID' : 'WORKING';
    return `${quality} DevOps: <span class="highlight-number">${data.builds.successful}</span>/<span class="highlight-number">${data.builds.total}</span> builds green, <span class="highlight-number">${data.deployments.production}</span> prod deploys, avg <span class="highlight-number">${data.avgBuildTime}</span>.`;
  }
}
