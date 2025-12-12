// Executive Dashboard type definitions

// Vendor Benchmark (for quadrant chart)
export interface VendorBenchmark {
  name: string;
  effectiveLOC: number;
  commits: number;
  leadTime: number;
  velocity: number;
}

// 2. Productivity Overview
export interface Productivity {
  manualLOCPerMonth: number;
  copilotLOCPerMonth: number;
  totalLOCPerMonth: number;
  perCapitalLOC: number;
  manualPct: number;
  copilotPct: number;
  acceptanceRate: number;
}

// 3. Commits & PR
export interface Commits {
  monthlyAvg: number;
  benchmarkPercentage: number;
  prSuccess: number;
  averageReviewTime: string;
}

// 4. Deployment & Build
export interface Deployment {
  productionPerMonth: number;
  benchmarkPercentage: number;
  buildSuccessRate: number;
  avgBuildTime: string;
}

// 5. Velocity & Lead Time
export interface Velocity {
  spPerMonth: number;
  benchmarkPercentage: number;
  leadTimeDays: number;
  leadTimeBenchmarkPercentage: number;
}

// 6. Top Contributor
export interface TopContributor {
  username: string;
  commits: number;
  percentage: number;
  rank: number;
}

// 8. Community & Knowledge
export interface Community {
  sharingEvents: number;
  monthlyAvgSharingEvents: number;
  peopleMentored: number;
  mentorshipRatio: number;
  bravoReceived: number;
  bravoGiven: number;
  bravoRatio: number;
}

// 9. Team Summary
export interface Summary {
  achievements: string[];
  improvements: string[];
  overallScore: number;
  targetAchievementRate: number;
  growthRate: number;
}

// Monthly Trend
export interface MonthlyTrend {
  month: string;
  manualLOC: number;
  copilotLOC: number;
  commits: number;
  deployments: number;
  prSuccessRate: number;
  leadTime: number;
}

// Chart Data Interfaces
export interface VendorQuadrantData {
  name: string;
  velocity: number;
  leadTime: number;
  isInternal: boolean;
}

export interface MonthlyTrendChartData {
  month: string;
  velocity?: number;
  leadTime?: number;
  prSuccessRate?: number;
  deployments?: number;
}

// Team Section Data Interfaces
export interface TeamBasicsData {
  headcount: number;
  employeePct: number;
  contractorPct: number;
}

export interface DeliveryMetric {
  id: string;
  name: string;
  label: string;
  unit: string;
  avg: number;
  min: number;
  max: number;
  median: number;
  orgAvg?: number;
  orgMedian?: number;
  target?: number;
  status: 'green' | 'yellow' | 'red';
}

export interface VendorMetric {
  id: string;
  name: string;
  label: string;
  unit: string;
  breakdown: Array<{
    name: string;
    headcount: number;
    employeePct: number;
    performanceScore: number;
  }>;
  avg: number;
  min: number;
  max: number;
  median: number;
  status: 'green' | 'yellow' | 'red';
}

export interface TeamDeliveryData {
  primary: DeliveryMetric[];
  secondary: DeliveryMetric[];
  vendor: VendorMetric;
  vendorBenchmarks?: DepartmentEntity['vendorBenchmarks'];
  monthlyTrends?: MonthlyTrend[];
}

export interface CodeQualityDist {
  grade: string;
  count?: number;
  pct: number;
}

export interface TeamQualityData {
  codeQuality: CodeQualityDist[];
  slaRate: number;
  slaTarget: number;
  prSuccessRate: number;
  prTarget: number;
}

export interface TeamCICDData {
  builds: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
  };
  deployments: {
    total: number;
    production: number;
    staging: number;
  };
  avgBuildTime: string;
  pipelinesConfigured: number;
  avg: number;
  min: number;
  max: number;
  median: number;
}

export interface TeamJiraData {
  tickets: {
    total: number;
    completed: number;
    inProgress: number;
    completionRate: number;
  };
  storiesCompleted: number;
  bugsFixed: number;
  avgCycleTime: string;
  avgCycleTimeDays: number;
  epicsContributed: number;
  topProjects: string[];
  avg: number;
  min: number;
  max: number;
  median: number;
}

export interface AIAdoptionSnapshot {
  month: string;
  activeUsers: number;
  activeDays: number;
  codeLines: number;
  velocity: number;
  qualityGrade: string;
}

export interface TeamAIData {
  aiAdoption: AIAdoptionSnapshot[];
  aiTargets: {
    activeUsersPct: number;
    activeDays: number;
    codeLines: number;
    velocity: number;
  };
  currentAdoption: {
    activeUsers: number;
    activeUsersPct: number;
    activeDays: number;
    codeLines: number;
    velocity: number;
    qualityGrade: string;
  };
  acceptanceRate: number;
}

export interface TeamSummary {
  id: string;
  name: string;
  cto: {
    name: string;
    title: string;
  };
  headcount: number;
  employeePct: number;
  contractorPct: number;
  basics: TeamBasicsData;
  delivery: TeamDeliveryData;
  quality: TeamQualityData;
  cicd: TeamCICDData;
  jira: TeamJiraData;
  ai: TeamAIData;
}

// ExecutiveDataPage Props
export interface ExecutiveDataPageProps {
  showMenu?: boolean;
  onReplay?: () => void;
  onDownload?: () => void;
  onBack?: () => void;
}

// Main Department Entity (Leadership Dashboard)
export interface DepartmentEntity {
  managerName: string;
  title: string;
  headcount: number;
  employeePct: number;
  contractorPct: number;
  productivity: Productivity;
  commits: Commits;
  deployment: Deployment;
  velocity: Velocity;
  topContributors: TopContributor[];
  vendorBenchmarks: {
    ssc: VendorBenchmark;
    accenture: VendorBenchmark;
    infosys: VendorBenchmark;
    industryAvg: VendorBenchmark;
  };
  community: Community;
  summary: Summary;
  totalCommits: number;
  totalPRs: number;
  mergedPRs: number;
  totalTickets: number;
  completedTickets: number;
  totalDeployments: number;
  productionDeployments: number;
  monthlyTrends: MonthlyTrend[];
}
