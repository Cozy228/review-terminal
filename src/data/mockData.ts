import type { ReviewData } from '../types';

export const mockReviewData: ReviewData = {
  user: {
    username: 'ziyu123213',
    role: 'Developer',
    joinDate: '2020-01-15',
    location: 'Earth',
  },
  git: {
    commits: [
      { date: '2025-01', count: 45 },
      { date: '2025-02', count: 52 },
      { date: '2025-03', count: 68 },
      { date: '2025-04', count: 71 },
      { date: '2025-05', count: 63 },
      { date: '2025-06', count: 58 },
      { date: '2025-07', count: 84 },
      { date: '2025-08', count: 76 },
      { date: '2025-09', count: 69 },
      { date: '2025-10', count: 73 },
      { date: '2025-11', count: 78 },
      { date: '2025-12', count: 65 },
    ],
    totalCommits: 2402,
    totalLines: 125847,
    topRepos: ['review-terminal', 'zen-ui', 'data-viz'],
    peakMonth: 'July',
    peakCommits: 84,
    longestStreak: 47,
    streakPeriod: 'Mar 15 - May 1',
  },
  techStack: {
    languages: [
      { name: 'TypeScript', percentage: 68.2, color: '#3178c6' },
      { name: 'JavaScript', percentage: 24.1, color: '#f7df1e' },
      { name: 'Python', percentage: 5.8, color: '#3776ab' },
      { name: 'Go', percentage: 1.9, color: '#00add8' },
    ],
    frameworks: [
      { name: 'React', hours: 2847 },
      { name: 'Node.js', hours: 1523 },
      { name: 'Next.js', hours: 892 },
    ],
    totalPackages: 247,
    totalProjects: 18,
  },
  workflow: {
    tickets: {
      todo: 0,
      inProgress: 48,
      done: 312,
      blocked: 24,
    },
    totalTickets: 384,
    completionRate: 81.2,
  },
};
