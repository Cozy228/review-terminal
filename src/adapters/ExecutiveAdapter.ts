import type {
  DepartmentEntity,
  MonthlyTrend,
  TeamBasicsData,
  TeamQualityData,
  TeamCICDData,
  TeamJiraData,
  TeamAIData,
  VendorMetric,
  DeliveryMetric,
} from '../types/executive';
import { generateProgressBar } from '../utils/ascii';

type Tone = 'green' | 'gold' | 'blue' | 'red' | 'purple' | 'pink' | 'orange' | 'primary';

interface StatCard {
  title: string;
  value: string;
  note?: string;
  tone?: Tone;
}

interface ProgressBar {
  label: string;
  percent: number;
  bar: string;
  tone: Tone;
}

// ============================================
// BASICS ADAPTER
// ============================================

export class BasicsAdapter {
  static toStatCards(data: TeamBasicsData): StatCard[] {
    return [
      {
        title: 'HEADCOUNT',
        value: data.headcount.toString(),
        note: 'Engineering team members',
        tone: 'primary'
      },
      {
        title: 'EMPLOYEES',
        value: `${data.employeePct}%`,
        note: `${Math.round(data.headcount * data.employeePct / 100)} FTE`,
        tone: 'green'
      },
      {
        title: 'CONTRACTORS',
        value: `${data.contractorPct}%`,
        note: `${Math.round(data.headcount * data.contractorPct / 100)} vendors`,
        tone: 'gold'
      }
    ];
  }

  static toNarrative(data: TeamBasicsData): string {
    const ftCount = Math.round(data.headcount * data.employeePct / 100);
    const contractorCount = Math.round(data.headcount * data.contractorPct / 100);
    return `Engineering org of <span class="highlight-number">${data.headcount}</span> people: <span class="highlight-number">${ftCount}</span> FTE (<span class="highlight-number">${data.employeePct}%</span>) + <span class="highlight-number">${contractorCount}</span> contractors (<span class="highlight-number">${data.contractorPct}%</span>).`;
  }

  static toEmployeeBar(data: TeamBasicsData): ProgressBar {
    return {
      label: 'Employee Ratio',
      percent: data.employeePct,
      bar: generateProgressBar(data.employeePct, 80),
      tone: 'green'
    };
  }
}

// ============================================
// DELIVERY ADAPTER
// ============================================

export class DeliveryAdapter {
  static toPrimaryCards(metrics: DeliveryMetric[]): StatCard[] {
    return metrics.map(metric => ({
      title: metric.label.toUpperCase(),
      value: `${metric.avg}${metric.unit}`,
      note: `Target: ${metric.target ? metric.target + metric.unit : 'N/A'}`,
      tone: metric.status === 'green' ? 'green' : metric.status === 'yellow' ? 'gold' : 'red'
    }));
  }

  static toSecondaryCards(metrics: DeliveryMetric[]): StatCard[] {
    return metrics.map(metric => ({
      title: metric.label.toUpperCase(),
      value: `${metric.avg}${metric.unit}`,
      note: `Median: ${metric.median}${metric.unit}`,
      tone: metric.status === 'green' ? 'blue' : metric.status === 'yellow' ? 'gold' : 'red'
    }));
  }

  static toVendorBars(vendor: VendorMetric): Array<ProgressBar & { name: string; headcount: number; score: number }> {
    const total = vendor.breakdown.reduce((sum, v) => sum + v.headcount, 0);
    return vendor.breakdown.map(v => ({
      name: v.name,
      headcount: v.headcount,
      score: v.performanceScore,
      label: v.name,
      percent: Math.round((v.headcount / total) * 100),
      bar: generateProgressBar((v.headcount / total) * 100, 60),
      tone: v.employeePct === 100 ? 'green' : 'gold' as Tone
    }));
  }

  static toVendorNarrative(vendor: VendorMetric): string {
    const internal = vendor.breakdown.find(v => v.employeePct === 100);
    const contractors = vendor.breakdown.filter(v => v.employeePct === 0);
    return `Resource mix: <span class="highlight-number">${internal?.headcount || 0}</span> internal + <span class="highlight-number">${contractors.reduce((sum, v) => sum + v.headcount, 0)}</span> contractors across <span class="highlight-number">${contractors.length}</span> vendors.`;
  }

  // Chart data transformations
  static toVendorQuadrantData(
    vendorBenchmarks: DepartmentEntity['vendorBenchmarks']
  ): Array<{ name: string; velocity: number; leadTime: number; isInternal: boolean }> {
    return [
      {
        name: vendorBenchmarks.ssc.name,
        velocity: vendorBenchmarks.ssc.velocity,
        leadTime: vendorBenchmarks.ssc.leadTime,
        isInternal: true,
      },
      {
        name: vendorBenchmarks.accenture.name,
        velocity: vendorBenchmarks.accenture.velocity,
        leadTime: vendorBenchmarks.accenture.leadTime,
        isInternal: false,
      },
      {
        name: vendorBenchmarks.infosys.name,
        velocity: vendorBenchmarks.infosys.velocity,
        leadTime: vendorBenchmarks.infosys.leadTime,
        isInternal: false,
      },
    ];
  }

  static toMonthlyTrendData(monthlyTrends: MonthlyTrend[]): Array<{ month: string; velocity: number; leadTime: number }> {
    return monthlyTrends.map(trend => ({
      month: trend.month,
      velocity: trend.commits * 0.12, // estimate: commits to story points
      leadTime: trend.leadTime,
    }));
  }

  static toTrendNarrative(monthlyTrends: MonthlyTrend[]): string {
    if (!monthlyTrends || monthlyTrends.length === 0) return '';
    const latest = monthlyTrends[monthlyTrends.length - 1];
    const earliest = monthlyTrends[0];
    const leadTimeChange = ((latest.leadTime - earliest.leadTime) / earliest.leadTime * 100).toFixed(1);
    const trend = parseFloat(leadTimeChange) < 0 ? 'improved' : 'increased';
    return `Lead time ${trend} by <span class="highlight-number">${Math.abs(parseFloat(leadTimeChange))}%</span> over 12 months. Current: <span class="highlight-number">${latest.leadTime}</span> days.`;
  }
}

// ============================================
// QUALITY ADAPTER
// ============================================

export class QualityAdapter {
  static toCodeQualityBars(quality: TeamQualityData): ProgressBar[] {
    return quality.codeQuality.map(q => ({
      label: `Grade ${q.grade}`,
      percent: q.pct,
      bar: generateProgressBar(q.pct, 60),
      tone: (q.grade === 'A' ? 'green' : q.grade === 'B' ? 'blue' : q.grade === 'C' ? 'gold' : 'red') as Tone
    }));
  }

  static toSLABar(quality: TeamQualityData): ProgressBar {
    return {
      label: 'SLA Achievement',
      percent: quality.slaRate,
      bar: generateProgressBar(quality.slaRate, 80),
      tone: quality.slaRate >= quality.slaTarget ? 'green' : 'gold'
    };
  }

  static toPRSuccessBar(quality: TeamQualityData): ProgressBar {
    return {
      label: 'PR Success Rate',
      percent: quality.prSuccessRate,
      bar: generateProgressBar(quality.prSuccessRate, 80),
      tone: quality.prSuccessRate >= quality.prTarget ? 'green' : 'gold'
    };
  }

  static toNarrative(quality: TeamQualityData): string {
    const abPct = quality.codeQuality.filter(q => q.grade === 'A' || q.grade === 'B').reduce((sum, q) => sum + q.pct, 0);
    return `Code quality: <span class="highlight-number">${abPct}%</span> A/B grade. SLA: <span class="highlight-number">${quality.slaRate}%</span>, PR success: <span class="highlight-number">${quality.prSuccessRate}%</span>.`;
  }

  // Quality overview cards
  static toQualityCards(data: TeamQualityData): StatCard[] {
    const abPct = data.codeQuality
      .filter(q => q.grade === 'A' || q.grade === 'B')
      .reduce((sum, q) => sum + q.pct, 0);

    return [
      {
        title: 'A/B GRADE',
        value: `${abPct}%`,
        note: 'High quality code',
        tone: abPct >= 80 ? 'green' : 'gold'
      },
      {
        title: 'SLA RATE',
        value: `${data.slaRate}%`,
        note: `Target: ${data.slaTarget}%`,
        tone: data.slaRate >= data.slaTarget ? 'green' : 'gold'
      },
      {
        title: 'PR SUCCESS',
        value: `${data.prSuccessRate}%`,
        note: `Target: ${data.prTarget}%`,
        tone: data.prSuccessRate >= data.prTarget ? 'green' : 'gold'
      }
    ];
  }
}

// ============================================
// TEAM CI/CD ADAPTER
// ============================================

export class TeamCICDAdapter {
  static toStatCards(data: TeamCICDData): StatCard[] {
    return [
      {
        title: 'TOTAL BUILDS',
        value: data.builds.total.toLocaleString(),
        note: `${data.builds.successful.toLocaleString()} successful`,
        tone: 'blue'
      },
      {
        title: 'SUCCESS RATE',
        value: `${data.builds.successRate}%`,
        note: `${data.builds.failed.toLocaleString()} failed`,
        tone: data.builds.successRate >= 95 ? 'green' : data.builds.successRate >= 85 ? 'gold' : 'red'
      },
      {
        title: 'DEPLOYMENTS',
        value: data.deployments.total.toLocaleString(),
        note: `${data.deployments.production.toLocaleString()} to production`,
        tone: 'purple'
      },
      {
        title: 'PIPELINES',
        value: data.pipelinesConfigured.toString(),
        note: 'Active CI/CD pipelines',
        tone: 'green'
      }
    ];
  }

  static toBuildSuccessBar(data: TeamCICDData): ProgressBar {
    return {
      label: 'Build Success Rate',
      percent: data.builds.successRate,
      bar: generateProgressBar(data.builds.successRate, 80),
      tone: data.builds.successRate >= 95 ? 'green' : data.builds.successRate >= 85 ? 'gold' : 'red'
    };
  }

  static toNarrative(data: TeamCICDData): string {
    const quality = data.builds.successRate >= 95 ? 'ELITE' : data.builds.successRate >= 85 ? 'STRONG' : 'BUILDING';
    return `${quality} DevOps performance: <span class="highlight-number">${data.builds.total.toLocaleString()}</span> builds with <span class="highlight-number">${data.builds.successRate}%</span> success rate. Avg build time: <span class="highlight-number">${data.avgBuildTime}</span>.`;
  }
}

// ============================================
// TEAM JIRA ADAPTER
// ============================================

export class TeamJiraAdapter {
  static toStatCards(data: TeamJiraData): StatCard[] {
    return [
      {
        title: 'TOTAL TICKETS',
        value: data.tickets.total.toLocaleString(),
        note: `${data.tickets.completed.toLocaleString()} completed`,
        tone: 'blue'
      },
      {
        title: 'COMPLETION RATE',
        value: `${data.tickets.completionRate}%`,
        note: `${data.tickets.inProgress.toLocaleString()} in progress`,
        tone: data.tickets.completionRate >= 80 ? 'green' : data.tickets.completionRate >= 60 ? 'gold' : 'red'
      },
      {
        title: 'STORIES',
        value: data.storiesCompleted.toLocaleString(),
        note: `${data.bugsFixed.toLocaleString()} bugs fixed`,
        tone: 'purple'
      },
      {
        title: 'AVG CYCLE TIME',
        value: data.avgCycleTime,
        note: `${data.epicsContributed} epics delivered`,
        tone: 'green'
      }
    ];
  }

  static toCompletionBar(data: TeamJiraData): ProgressBar {
    return {
      label: 'Ticket Completion',
      percent: data.tickets.completionRate,
      bar: generateProgressBar(data.tickets.completionRate, 80),
      tone: data.tickets.completionRate >= 80 ? 'green' : data.tickets.completionRate >= 60 ? 'gold' : 'red'
    };
  }

  static toProjectList(data: TeamJiraData): Array<{ name: string; icon: string; index: number }> {
    return data.topProjects.map((project, i) => ({
      name: project,
      icon: '▸',
      index: i + 1
    }));
  }

  static toNarrative(data: TeamJiraData): string {
    return `Delivered <span class="highlight-number">${data.tickets.completed.toLocaleString()}</span> tickets (<span class="highlight-number">${data.tickets.completionRate}%</span> completion) with <span class="highlight-number">${data.avgCycleTime}</span> avg cycle time across <span class="highlight-number">${data.epicsContributed}</span> epics.`;
  }
}

// ============================================
// AI ADAPTER
// ============================================

export class AIAdapter {
  static toStatCards(data: TeamAIData): StatCard[] {
    return [
      {
        title: 'ACTIVE USERS',
        value: data.currentAdoption.activeUsers.toString(),
        note: `${data.currentAdoption.activeUsersPct}% adoption`,
        tone: 'purple'
      },
      {
        title: 'ACTIVE DAYS',
        value: data.currentAdoption.activeDays.toString(),
        note: `Target: ${data.aiTargets.activeDays} days/mo`,
        tone: 'blue'
      },
      {
        title: 'CODE LINES',
        value: data.currentAdoption.codeLines.toLocaleString(),
        note: `AI-generated per person`,
        tone: 'green'
      },
      {
        title: 'QUALITY GRADE',
        value: data.currentAdoption.qualityGrade,
        note: 'Code quality with AI',
        tone: data.currentAdoption.qualityGrade === 'A' ? 'green' : data.currentAdoption.qualityGrade.startsWith('A') ? 'blue' : 'gold'
      }
    ];
  }

  static toAdoptionBar(data: TeamAIData): ProgressBar {
    return {
      label: 'AI Adoption',
      percent: data.currentAdoption.activeUsersPct,
      bar: generateProgressBar(data.currentAdoption.activeUsersPct, 80),
      tone: data.currentAdoption.activeUsersPct >= data.aiTargets.activeUsersPct ? 'green' : 'gold'
    };
  }

  static toAcceptanceBar(data: TeamAIData): ProgressBar {
    return {
      label: 'Code Acceptance',
      percent: data.acceptanceRate,
      bar: generateProgressBar(data.acceptanceRate, 80),
      tone: data.acceptanceRate >= 70 ? 'green' : data.acceptanceRate >= 60 ? 'gold' : 'red'
    };
  }

  static toNarrative(data: TeamAIData): string {
    const trend = data.currentAdoption.qualityGrade >= 'A' ? 'ELITE' : data.currentAdoption.qualityGrade >= 'B' ? 'STRONG' : 'GROWING';
    return `${trend} AI adoption: <span class="highlight-number">${data.currentAdoption.activeUsers}</span> users (<span class="highlight-number">${data.currentAdoption.activeUsersPct}%</span>) generating <span class="highlight-number">${data.currentAdoption.codeLines.toLocaleString()}</span> lines/person with grade <span class="highlight-number">${data.currentAdoption.qualityGrade}</span>.`;
  }
}
