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

    const deploymentRate = data.deployments.total > 0
      ? Math.round((data.deployments.production / data.deployments.total) * 100)
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
        note: `${data.deployments.production} to production`,
        tone: 'blue'
      },
      {
        title: 'AVG BUILD TIME',
        value: data.avgBuildTime,
        note: 'Fast and furious.',
        tone: 'gold'
      },
      {
        title: 'PIPELINES',
        value: data.pipelinesConfigured.toString(),
        note: 'Automation locked in.',
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
    return `${quality} DevOps: ${data.builds.successful}/${data.builds.total} builds green, ${data.deployments.production} prod deploys, avg ${data.avgBuildTime}.`;
  }
}
