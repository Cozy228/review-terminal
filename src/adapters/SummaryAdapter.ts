import type { Badge, BadgeRarity, ReviewDataSeed, SummaryData } from '../types';

type HighlightCandidate = {
  id: string;
  score: number;
  variants: Array<() => string>;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const scale01 = (value: number, min: number, max: number) => {
  if (max <= min) return 0;
  return clamp((value - min) / (max - min), 0, 1);
};

const randomInt = (minInclusive: number, maxInclusive: number) => {
  const min = Math.ceil(minInclusive);
  const max = Math.floor(maxInclusive);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const pickOne = <T,>(items: T[]): T => items[randomInt(0, Math.max(0, items.length - 1))] as T;

const shuffle = <T,>(items: T[]): T[] => {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = randomInt(0, i);
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

const sample = <T,>(items: T[], count: number): T[] => shuffle(items).slice(0, Math.max(0, Math.min(count, items.length)));

const buildHighlights = (seed: ReviewDataSeed): string[] => {
  const { git, workflow, cicd, jira, copilot, learning, community, techStack } = seed;

  const totalCommits = git.totalCommits;
  const totalLines = git.totalLines;
  const peakMonth = git.peakMonth;
  const peakCommits = git.peakCommits;
  const longestStreak = git.longestStreak;
  const mergeRate = git.pullRequests.opened > 0 ? Math.round((git.pullRequests.merged / git.pullRequests.opened) * 100) : 0;

  const buildSuccessRate = cicd.builds.total > 0 ? Math.round((cicd.builds.successful / cicd.builds.total) * 100) : 0;

  const topLanguage = techStack.languages.length
    ? [...techStack.languages].sort((a, b) => b.percentage - a.percentage)[0]
    : null;

  const commitScore = scale01(totalCommits, 600, 2600) * 100;
  const prScore = clamp(mergeRate, 0, 100);
  const cicdScore = clamp(buildSuccessRate, 0, 100);
  const flowScore = clamp(workflow.completionRate, 0, 100);
  const aiScore = clamp(copilot.acceptanceRate, 0, 100);
  const learningScore = scale01(learning.hoursLearning, 40, 220) * 100;
  const communityScore = scale01(community.bravosGiven + community.bravosReceived, 20, 120) * 100;

  const candidates: HighlightCandidate[] = [
    {
      id: 'git-velocity',
      score: commitScore * 0.7 + scale01(longestStreak, 7, 60) * 30,
      variants: [
        () =>
          `Logged ${totalCommits.toLocaleString()} commits and kept a ${longestStreak}-day streak — steady momentum all year.`,
        () =>
          `Hit peak speed in ${peakMonth} with ${peakCommits} commits, then sustained a ${longestStreak}-day streak.`,
      ],
    },
    {
      id: 'pr-impact',
      score: prScore * 0.75 + scale01(git.pullRequests.reviewed, 50, 260) * 25,
      variants: [
        () =>
          `Merged ${git.pullRequests.merged.toLocaleString()} PRs with a ${mergeRate}% merge rate, and reviewed ${git.pullRequests.reviewed.toLocaleString()} to keep quality high.`,
        () =>
          `Shipped ${git.pullRequests.merged.toLocaleString()} merges and supported the team with ${git.pullRequests.reviewed.toLocaleString()} reviews — strong delivery + strong standards.`,
      ],
    },
    {
      id: 'delivery-reliability',
      score: cicdScore * 0.8 + scale01(cicd.deployments.production, 10, 45) * 20,
      variants: [
        () =>
          `Delivered ${cicd.deployments.production.toLocaleString()} production deployments with a ${buildSuccessRate}% build success rate — reliability at scale.`,
        () =>
          `Kept releases flowing: ${cicd.deployments.production.toLocaleString()} prod deploys, ${buildSuccessRate}% build success, avg build time ${cicd.avgBuildTime}.`,
      ],
    },
    {
      id: 'workflow-execution',
      score: flowScore * 0.9 + scale01(workflow.tickets.done, 80, 340) * 10,
      variants: [
        () =>
          `Closed ${workflow.tickets.done.toLocaleString()} tasks with an ${workflow.completionRate.toFixed(1)}% completion rate — consistent execution.`,
        () =>
          `Strong throughput: ${workflow.tickets.done.toLocaleString()} done, ${workflow.tickets.inProgress.toLocaleString()} in progress, ${workflow.completionRate.toFixed(1)}% completion rate.`,
      ],
    },
    {
      id: 'jira-outcomes',
      score: scale01(jira.tickets.completed, 60, 220) * 55 + scale01(jira.bugsFixed, 10, 70) * 45,
      variants: [
        () =>
          `Completed ${jira.tickets.completed.toLocaleString()} Jira tickets, including ${jira.storiesCompleted.toLocaleString()} stories and ${jira.bugsFixed.toLocaleString()} bug fixes.`,
        () =>
          `Turned plans into outcomes: ${jira.storiesCompleted.toLocaleString()} stories shipped and ${jira.bugsFixed.toLocaleString()} bugs resolved.`,
      ],
    },
    {
      id: 'ai-leverage',
      score: aiScore,
      variants: [
        () =>
          `Paired with AI at a ${copilot.acceptanceRate}% acceptance rate and translated ${copilot.linesGenerated.toLocaleString()} generated lines into product progress.`,
        () =>
          `Great AI collaboration: ${copilot.acceptanceRate}% acceptance, ${copilot.suggestionsAccepted.toLocaleString()} suggestions adopted, ${copilot.timesSaved} saved.`,
      ],
    },
    {
      id: 'learning-growth',
      score: learningScore,
      variants: [
        () =>
          `Invested ${learning.hoursLearning}h in learning, completed ${learning.coursesCompleted} courses, and earned ${learning.certificationsEarned} certifications.`,
        () =>
          `Level-up mode: ${learning.hoursLearning}h learning time across ${learning.skills.length} skills, plus ${learning.certificationsEarned} new certifications.`,
      ],
    },
    {
      id: 'community-impact',
      score: communityScore,
      variants: [
        () =>
          `Built strong team energy: ${community.bravosGiven} bravos given, ${community.bravosReceived} received, and ${community.activities.length} community activities.`,
        () =>
          `Positive impact: ${community.bravosGiven + community.bravosReceived} bravos exchanged and ${community.activities.length} events joined.`,
      ],
    },
    {
      id: 'stack-focus',
      score: topLanguage ? clamp(topLanguage.percentage, 0, 100) : 20,
      variants: [
        () =>
          topLanguage
            ? `Stayed sharp on ${topLanguage.name} (${topLanguage.percentage.toFixed(1)}%) while steadily expanding across ${techStack.languages.length} languages.`
            : `Expanded your toolkit across ${techStack.languages.length} languages and ${techStack.frameworks.length} frameworks.`,
      ],
    },
    {
      id: 'code-volume',
      score: scale01(totalLines, 5000, 150000) * 100,
      variants: [
        () =>
          `Delivered ${totalLines.toLocaleString()} lines of code with a strong pace — focused output, measurable impact.`,
        () =>
          `Created tangible impact: ${totalLines.toLocaleString()} lines added and ${totalCommits.toLocaleString()} commits logged.`,
      ],
    },
  ];

  const ranked = [...candidates].sort((a, b) => b.score - a.score);
  const topPool = ranked.slice(0, Math.min(6, ranked.length));
  const picked = sample(topPool, 4);
  return picked.map((candidate) => pickOne(candidate.variants)());
};

type BadgeTemplate = {
  id: string;
  icon: string;
  name: string;
  isEligible: (seed: ReviewDataSeed) => boolean;
  getRarity: (seed: ReviewDataSeed) => BadgeRarity;
  getDescription: (seed: ReviewDataSeed) => string;
};

const buildBadges = (seed: ReviewDataSeed): Badge[] => {
  const buildSuccessRate = seed.cicd.builds.total > 0
    ? Math.round((seed.cicd.builds.successful / seed.cicd.builds.total) * 100)
    : 0;

  const mergeRate = seed.git.pullRequests.opened > 0
    ? Math.round((seed.git.pullRequests.merged / seed.git.pullRequests.opened) * 100)
    : 0;

  const templates: BadgeTemplate[] = [
    {
      id: 'commit-champion',
      icon: '🏆',
      name: 'Commit Champion',
      isEligible: (s) => s.git.totalCommits >= 900,
      getRarity: (s) => (s.git.totalCommits >= 2400 ? 'legendary' : s.git.totalCommits >= 1600 ? 'epic' : 'rare'),
      getDescription: (s) => `Delivered ${s.git.totalCommits.toLocaleString()} commits with consistent momentum.`,
    },
    {
      id: 'streak-master',
      icon: '🔥',
      name: 'Streak Master',
      isEligible: (s) => s.git.longestStreak >= 14,
      getRarity: (s) => (s.git.longestStreak >= 60 ? 'legendary' : s.git.longestStreak >= 35 ? 'epic' : 'rare'),
      getDescription: (s) => `Maintained a ${s.git.longestStreak}-day streak — consistency unlocked.`,
    },
    {
      id: 'merge-captain',
      icon: '⚡',
      name: 'Merge Captain',
      isEligible: (s) => s.git.pullRequests.merged >= 60,
      getRarity: (s) => {
        const rate = s.git.pullRequests.opened > 0
          ? Math.round((s.git.pullRequests.merged / s.git.pullRequests.opened) * 100)
          : 0;
        return rate >= 92 ? 'epic' : rate >= 80 ? 'rare' : 'common';
      },
      getDescription: (s) => `Merged ${s.git.pullRequests.merged.toLocaleString()} PRs with a ${mergeRate}% merge rate.`,
    },
    {
      id: 'review-mentor',
      icon: '🧠',
      name: 'Review Mentor',
      isEligible: (s) => s.git.pullRequests.reviewed >= 80,
      getRarity: (s) => (s.git.pullRequests.reviewed >= 220 ? 'epic' : s.git.pullRequests.reviewed >= 140 ? 'rare' : 'common'),
      getDescription: (s) => `Reviewed ${s.git.pullRequests.reviewed.toLocaleString()} PRs and raised the quality bar.`,
    },
    {
      id: 'release-runner',
      icon: '🚀',
      name: 'Release Runner',
      isEligible: (s) => s.cicd.deployments.production >= 12,
      getRarity: (s) => (s.cicd.deployments.production >= 40 ? 'epic' : s.cicd.deployments.production >= 25 ? 'rare' : 'common'),
      getDescription: (s) => `Shipped ${s.cicd.deployments.production.toLocaleString()} production deployments with confidence.`,
    },
    {
      id: 'build-guardian',
      icon: '🛡️',
      name: 'Build Guardian',
      isEligible: () => buildSuccessRate >= 85,
      getRarity: () => (buildSuccessRate >= 96 ? 'legendary' : buildSuccessRate >= 92 ? 'epic' : 'rare'),
      getDescription: () => `Protected reliability with a ${buildSuccessRate}% build success rate.`,
    },
    {
      id: 'ai-ally',
      icon: '🤖',
      name: 'AI Ally',
      isEligible: (s) => s.copilot.acceptanceRate >= 40,
      getRarity: (s) => (s.copilot.acceptanceRate >= 75 ? 'epic' : s.copilot.acceptanceRate >= 60 ? 'rare' : 'common'),
      getDescription: (s) => `Partnered with AI at ${s.copilot.acceptanceRate}% acceptance — efficient collaboration.`,
    },
    {
      id: 'growth-hacker',
      icon: '📚',
      name: 'Growth Hacker',
      isEligible: (s) => s.learning.hoursLearning >= 60,
      getRarity: (s) => (s.learning.hoursLearning >= 200 ? 'epic' : s.learning.hoursLearning >= 120 ? 'rare' : 'common'),
      getDescription: (s) => `Invested ${s.learning.hoursLearning}h learning and expanded your skill set.`,
    },
    {
      id: 'community-builder',
      icon: '🤝',
      name: 'Community Builder',
      isEligible: (s) => s.community.bravosGiven + s.community.bravosReceived >= 30,
      getRarity: (s) => (s.community.bravosGiven + s.community.bravosReceived >= 90 ? 'epic' : s.community.activities.length >= 4 ? 'rare' : 'common'),
      getDescription: (s) => `Exchanged ${s.community.bravosGiven + s.community.bravosReceived} bravos and strengthened team culture.`,
    },
    {
      id: 'polyglot',
      icon: '🌐',
      name: 'Polyglot Builder',
      isEligible: (s) => s.techStack.languages.length >= 3,
      getRarity: (s) => (s.techStack.languages.length >= 5 ? 'rare' : 'common'),
      getDescription: (s) => `Built across ${s.techStack.languages.length} languages with a strong foundation.`,
    },
  ];

  const eligible = templates.filter((t) => t.isEligible(seed));
  const badgeCount = randomInt(4, 6);
  const picked = sample(eligible.length ? eligible : templates, badgeCount);

  return picked.map((t) => ({
    id: t.id,
    name: t.name,
    icon: t.icon,
    description: t.getDescription(seed),
    rarity: t.getRarity(seed),
  }));
};

const buildOverallScore = (seed: ReviewDataSeed) => {
  const mergeRate = seed.git.pullRequests.opened > 0
    ? Math.round((seed.git.pullRequests.merged / seed.git.pullRequests.opened) * 100)
    : 0;

  const buildSuccessRate = seed.cicd.builds.total > 0
    ? Math.round((seed.cicd.builds.successful / seed.cicd.builds.total) * 100)
    : 0;

  const commitScore = scale01(seed.git.totalCommits, 600, 2600) * 100;
  const prScore = clamp(mergeRate, 0, 100);
  const cicdScore = clamp(buildSuccessRate, 0, 100);
  const flowScore = clamp(seed.workflow.completionRate, 0, 100);
  const aiScore = clamp(seed.copilot.acceptanceRate, 0, 100);
  const learningScore = scale01(seed.learning.hoursLearning, 40, 220) * 100;
  const communityScore = scale01(seed.community.bravosGiven + seed.community.bravosReceived, 20, 120) * 100;

  const weighted =
    commitScore * 0.22 +
    prScore * 0.16 +
    cicdScore * 0.22 +
    flowScore * 0.12 +
    aiScore * 0.10 +
    learningScore * 0.08 +
    communityScore * 0.10;

  const jitter = randomInt(-5, 5);
  return clamp(Math.round(weighted + jitter), 70, 99);
};

const buildGrowthPercentage = (overallScore: number) => {
  const base = randomInt(6, 22);
  const bonus = Math.round(clamp((overallScore - 82) / 4, 0, 6));
  return clamp(base + bonus, 5, 35);
};

export class SummaryAdapter {
  static fromSeed(seed: ReviewDataSeed): SummaryData {
    const overallScore = buildOverallScore(seed);
    return {
      highlights: buildHighlights(seed),
      badges: buildBadges(seed),
      overallScore,
      growthPercentage: buildGrowthPercentage(overallScore),
    };
  }
}
