import type { GitData } from '../types';

export class GitAdapter {
  static toCommitChart(data: GitData): string {
    const commits = data.commits;
    const maxCommits = Math.max(...commits.map(c => c.count));
    
    // Create chart lines
    const lines: string[] = [];
    const levels = [80, 60, 40, 20, 0];
    
    lines.push('  Commit Velocity (2025)');
    lines.push('  ┌───────────────────────────────────────────────────┐');
    
    // Create data points for visualization
    const points = commits.map(c => Math.round((c.count / maxCommits) * 4));
    
    // Draw chart lines from top to bottom
    for (let level = 4; level >= 0; level--) {
      let line = `  │   ${levels[level].toString().padStart(2)} ┤`;
      
      for (let i = 0; i < points.length; i++) {
        const height = points[i];
        const prevHeight = i > 0 ? points[i - 1] : 0;
        const nextHeight = i < points.length - 1 ? points[i + 1] : 0;
        
        if (height > level) {
          if (prevHeight <= level && height > level) {
            line += '╭';
          } else if (nextHeight <= level && height > level) {
            line += '╮';
          } else if (height > level && prevHeight > level) {
            line += '─';
          } else {
            line += '─';
          }
        } else if (height === level) {
          if (prevHeight < level) {
            line += '╭';
          } else if (nextHeight < level) {
            line += '╮';
          } else {
            line += '─';
          }
        } else {
          line += ' ';
        }
        
        // Add spacing between months
        if (i < points.length - 1) {
          line += '   ';
        }
      }
      
      line += '│';
      lines.push(line);
    }
    
    lines.push('  │        Jan  Mar  May  Jul  Sep  Nov          Dec │');
    lines.push('  └───────────────────────────────────────────────────┘');
    
    return lines.join('\n');
  }

  static formatStats(data: GitData): string[] {
    return [
      `  ✨ Peak Performance: ${data.peakMonth} (${data.peakCommits} commits)`,
      `  🔥 Longest Streak: ${data.longestStreak} days (${data.streakPeriod})`,
      `  📊 Total Lines Added: ${data.totalLines.toLocaleString()}`,
    ];
  }
}
