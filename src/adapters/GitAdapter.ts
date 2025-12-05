import plot from 'simple-ascii-chart';
import type { GitData } from '../types';
import { generateBlockChart } from '../utils/ascii';

type StatTone = 'green' | 'gold' | 'blue' | 'red';

interface StatCard {
  title: string;
  value: string;
  note?: string;
  tone?: StatTone;
}

export class GitAdapter {
  static toCommitChart(data: GitData): string {
    const commits = data.commits;
    
    // Prepare data for simple-ascii-chart - line chart with [x, y] points
    const chartData = commits.map((c, index) => {
      return [index + 1, c.count] as [number, number];
    });
    
    // Create line chart
    const chart = plot(chartData, {
      title: 'Commit Velocity (2025)',
      width: 60,
      height: 10,
      formatter: (n: number, { axis }) => {
        if (axis === 'y') return n.toString();
        // Map x values back to month names
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIndex = parseInt(commits[n - 1]?.date.split('-')[1] || '1') - 1;
        return monthNames[monthIndex] || '';
      }
    });
    
    // Remove ANSI color codes from output
    // eslint-disable-next-line no-control-regex
    return chart.replace(/\x1b\[[0-9;]*m/g, '');
  }

  static formatStats(data: GitData): string[] {
    return [
      `Peak Performance: ${data.peakMonth} (${data.peakCommits} commits)`,
      `Longest Streak: ${data.longestStreak} days (${data.streakPeriod})`,
      `Total Lines Added: ${data.totalLines.toLocaleString()}`,
    ];
  }

  static formatStatsWithIcons(data: GitData) {
    return [
      {
        icon: 'TrendingUp',
        color: 'var(--accent-success)',
        text: `Peak Performance: ${data.peakMonth} (${data.peakCommits} commits)`
      },
      {
        icon: 'Flame',
        color: 'var(--accent-error)',
        text: `Longest Streak: ${data.longestStreak} days (${data.streakPeriod})`
      },
      {
        icon: 'FileText',
        color: 'var(--accent-info)',
        text: `Total Lines Added: ${data.totalLines.toLocaleString()}`
      }
    ];
  }

  static toStatCards(data: GitData): StatCard[] {
    const productive = data.totalCommits > 1200;
    const precision = data.totalCommits < 800;

    return [
      {
        title: 'TOTAL COMMITS',
        value: data.totalCommits.toLocaleString(),
        note: productive ? 'Keyboard on fire!' : 'Tactical precision.',
        tone: 'green'
      },
      {
        title: 'LINES OF CODE',
        value: data.totalLines.toLocaleString(),
        note: 'Enough to script a saga.',
        tone: 'blue'
      },
      {
        title: 'LONGEST STREAK',
        value: `${data.longestStreak} days`,
        note: `From ${data.streakPeriod}`,
        tone: 'gold'
      },
      {
        title: 'PEAK MONTH',
        value: `${data.peakMonth} (${data.peakCommits})`,
        note: data.topRepos[0] ? `Top repo: ${data.topRepos[0]}` : 'Steady output.',
        tone: 'green'
      }
    ];
  }

  static toMonthlyBlocks(data: GitData): string {
    const values = data.commits.map((c) => c.count);
    const monthLabels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    const labels = data.commits.map((c, index) => {
      const month = c.date.split('-')[1];
      const monthIndex = Math.max(0, Math.min(11, Number(month) - 1));
      return monthLabels[monthIndex] || monthLabels[index] || ' ';
    });
    return generateBlockChart(values, labels, 8);
  }

  static toNarrative(data: GitData): string {
    const quality = data.totalCommits > 2000 ? 'ARCH-MAGE' : data.totalCommits > 1200 ? 'SENIOR' : 'ADEPT';
    return `LV.${quality} coder: ${data.totalCommits.toLocaleString()} commits, peak ${data.peakMonth} (${data.peakCommits}), streak ${data.longestStreak} days.`;
  }
}
