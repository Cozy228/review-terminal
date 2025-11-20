import plot from 'simple-ascii-chart';
import type { GitData } from '../types';

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
}
