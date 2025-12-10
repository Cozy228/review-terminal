import type { GitData, ContributionGridData, MonthContributionData } from '../types';

type StatTone = 'green' | 'gold' | 'blue' | 'red' | 'pink' | 'purple' | 'orange';

interface StatCard {
  title: string;
  value: string;
  note?: string;
  tone?: StatTone;
}

export class GitAdapter {

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

    // Calculate PR merge rate
    const mergeRate = data.pullRequests.opened > 0
      ? Math.round((data.pullRequests.merged / data.pullRequests.opened) * 100)
      : 0;

    // Parse avg review time for smart notes
    const reviewTime = data.pullRequests.avgReviewTime;
    const hasHours = reviewTime.includes('hour');
    const reviewHours = hasHours ? parseFloat(reviewTime) : null;

    return [
      {
        title: 'TOTAL COMMITS',
        value: data.totalCommits.toLocaleString(),
        note: productive ? 'Keyboard begging for mercy' : 'Quality over quantity',
        tone: 'green'
      },
      {
        title: 'LINES OF CODE',
        value: data.totalLines.toLocaleString(),
        note: 'Epic codebase expansion',
        tone: 'blue'
      },
      {
        title: 'LONGEST STREAK',
        value: `${data.longestStreak} days`,
        note: `Marathon from ${data.streakPeriod}`,
        tone: 'gold'
      },
      {
        title: 'PEAK MONTH',
        value: `${data.peakMonth} (${data.peakCommits})`,
        note: data.topRepos[0] ? `Dominated ${data.topRepos[0]}` : 'Consistency is key',
        tone: 'orange'
      },
      {
        title: 'PRs OPENED',
        value: data.pullRequests.opened.toLocaleString(),
        note: data.pullRequests.opened > 150 ? 'PR machine on overdrive' :
              data.pullRequests.opened > 100 ? 'Shipping code like a boss' :
              data.pullRequests.opened > 50 ? 'Steady stream of features' :
              'Quality over quantity',
        tone: 'purple'
      },
      {
        title: 'PRs MERGED',
        value: data.pullRequests.merged.toLocaleString(),
        note: mergeRate > 90 ? 'LGTM streak legendary' :
              mergeRate > 80 ? 'Merge game strong' :
              mergeRate > 70 ? `${mergeRate}% merge rate` :
              'Iterating to perfection',
        tone: 'pink'
      },
      {
        title: 'PRs REVIEWED',
        value: data.pullRequests.reviewed.toLocaleString(),
        note: data.pullRequests.reviewed > data.pullRequests.merged ? 'Code review champion' :
              data.pullRequests.reviewed > data.pullRequests.opened ? 'Team player energy' :
              'Crushing peer reviews',
        tone: 'gold'
      },
      {
        title: 'AVG REVIEW TIME',
        value: reviewTime,
        note: reviewHours && reviewHours < 6 ? 'Lightning-fast feedback' :
              reviewHours && reviewHours < 12 ? 'Keeping velocity high' :
              reviewTime.includes('day') && parseFloat(reviewTime) < 2 ? 'Review velocity on point' :
              'Thoughtful code reviews',
        tone: 'red'
      }
    ];
  }

  static toMonthlyBlocks(data: GitData): string {
    if (!data.commits.length) return '';

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const max = Math.max(...data.commits.map(c => c.count), 1);

    // Create a horizontal grid of contribution blocks
    const blocks = data.commits.map((commit, index) => {
      const month = commit.date.split('-')[1];
      const monthIndex = Math.max(0, Math.min(11, Number(month) - 1));
      const monthLabel = monthNames[monthIndex] || monthNames[index] || '';

      // Calculate intensity level (0-4) based on commit count
      const intensity = commit.count / max;
      let level = 0;
      if (intensity > 0) level = 1;
      if (intensity > 0.25) level = 2;
      if (intensity > 0.5) level = 3;
      if (intensity > 0.75) level = 4;

      return `<div class="contrib-month" data-count="${commit.count}" data-month="${monthLabel}">
        <div class="contrib-block level-${level}" title="${monthLabel}: ${commit.count} commits">
          <span class="contrib-count">${commit.count}</span>
        </div>
        <div class="contrib-label">${monthLabel}</div>
      </div>`;
    }).join('');

    return `<div class="contribution-grid">${blocks}</div>`;
  }

  static toContributionGridData(data: GitData): ContributionGridData {
    if (!data.commits.length) return { months: [], maxCount: 0 };

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const max = Math.max(...data.commits.map(c => c.count), 1);

    const months: MonthContributionData[] = data.commits.map((commit, index) => {
      const month = commit.date.split('-')[1];
      const monthIndex = Math.max(0, Math.min(11, Number(month) - 1));
      const monthLabel = monthNames[monthIndex] || monthNames[index] || '';

      // Calculate intensity level (0-4) based on commit count
      const intensity = commit.count / max;
      let level: 0 | 1 | 2 | 3 | 4 = 0;
      if (intensity > 0) level = 1;
      if (intensity > 0.25) level = 2;
      if (intensity > 0.5) level = 3;
      if (intensity > 0.75) level = 4;

      return {
        month: monthLabel,
        count: commit.count,
        level,
        date: commit.date
      };
    });

    return { months, maxCount: max };
  }

  static toNarrative(data: GitData): string {
    const quality = data.totalCommits > 2000 ? 'ARCH-MAGE' : data.totalCommits > 1200 ? 'SENIOR' : 'ADEPT';
    return `LV.${quality} coder: <span class="highlight-number">${data.totalCommits.toLocaleString()}</span> commits, peak <span class="highlight-number">${data.peakMonth}</span> (<span class="highlight-number">${data.peakCommits}</span>), streak <span class="highlight-number">${data.longestStreak}</span> days.`;
  }

  static toCollaboratorList(data: GitData): Array<{
    username: string;
    prsTogether: number;
    reviewsExchanged: number;
    avatar?: string;
  }> {
    return data.collaborators;
  }
}
