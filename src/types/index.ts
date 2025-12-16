// Data Layer Schema

export interface UserInfo {
  username: string;
  avatar?: string;
  joinDate: string;
  location?: string;
  role: string;
  jobTitle: string;
  department?: string;
}

export interface CommitData {
  date: string;
  count: number;
}

export interface PRData {
  opened: number;
  merged: number;
  reviewed: number;
  avgReviewTime: string;
}

export interface CollaboratorData {
  username: string;
  avatar?: string;
  prsTogether: number;
  reviewsExchanged: number;
}

export interface GitData {
  commits: CommitData[];
  totalCommits: number;
  totalLines: number;
  topRepos: string[];
  peakMonth: string;
  peakCommits: number;
  longestStreak: number;
  streakPeriod: string;
  pullRequests: PRData;
  collaborators: CollaboratorData[];
}

export interface MonthContributionData {
  month: string;        // "Jan", "Feb", etc.
  count: number;        // commit count
  level: 0 | 1 | 2 | 3 | 4;  // intensity level for CSS
  date: string;         // original date "2025-01"
}

export interface ContributionGridData {
  months: MonthContributionData[];
  maxCount: number;
}

export interface Language {
  name: string;
  percentage: number;
  color: string;
}

export interface Framework {
  name: string;
  hours: number;
}

export interface TechStackData {
  languages: Language[];
  frameworks: Framework[];
}

export interface TicketStats {
  todo: number;
  inProgress: number;
  done: number;
  blocked: number;
}

export interface WorkflowData {
  tickets: TicketStats;
  totalTickets: number;
  completionRate: number;
}

export interface CICDData {
  builds: {
    total: number;
    successful: number;
    failed: number;
  };
  deployments: {
    total: number;
    production: number;
    staging: number;
  };
  avgBuildTime: string;
  pipelinesConfigured: number;
}

export interface JiraData {
  tickets: {
    total: number;
    completed: number;
    inProgress: number;
  };
  storiesCompleted: number;
  bugsFixed: number;
  avgCycleTime: string;
  epicsContributed: number;
  topProjects: string[];
}

export interface CopilotData {
  acceptanceRate: number;
  suggestionsAccepted: number;
  linesGenerated: number;
  activeDays: number;
  timesSaved: string;
}

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface SkillData {
  name: string;
  level: SkillLevel;
}

export interface LearningData {
  coursesCompleted: number;
  certificationsEarned: number;
  skills: SkillData[];
  hoursLearning: number;
}

export type CommunityActivityType = 'tech-talk' | 'hackathon' | 'session';

export interface ActivityData {
  role: string;
  name: string;
  date: string;
  type: CommunityActivityType;
}

export interface CommunityData {
  bravosReceived: number;
  bravosGiven: number;
  activities: ActivityData[];
}

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: BadgeRarity;
}

export interface SummaryData {
  highlights: string[];
  badges: Badge[];
  overallScore: number;
  growthPercentage: number;
}

export interface ReviewData {
  user: UserInfo;
  git: GitData;
  techStack: TechStackData;
  workflow: WorkflowData;
  cicd: CICDData;
  jira: JiraData;
  copilot: CopilotData;
  learning: LearningData;
  community: CommunityData;
  summary: SummaryData;
}

export type ReviewDataSeed = Omit<ReviewData, 'summary'>;

export type AnimationPhase =
  | 'boot'
  | 'idle'
  | 'auth'
  | 'git'
  | 'stack'
  | 'flow'
  | 'cicd'
  | 'jira'
  | 'copilot'
  | 'learning'
  | 'community'
  | 'summary';

export type TerminalStatus =
  | 'READY'
  | 'AUTHORIZING...'
  | 'LOADING...'
  | 'PROCESSING...'
  | 'EXPORTING...'
  | 'COMPLETE'
  | 'ERROR';
