// Data Layer Schema

export interface UserInfo {
  username: string;
  avatar?: string;
  joinDate: string;
  location?: string;
  role: string;
}

export interface CommitData {
  date: string;
  count: number;
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
  totalPackages: number;
  totalProjects: number;
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

export interface ReviewData {
  user: UserInfo;
  git: GitData;
  techStack: TechStackData;
  workflow: WorkflowData;
}

export type AnimationPhase = 'boot' | 'idle' | 'auth' | 'git' | 'stack' | 'flow' | 'summary';

export type TerminalStatus = 'READY' | 'BUILDING...' | 'COMPLETE' | 'IDLE';
