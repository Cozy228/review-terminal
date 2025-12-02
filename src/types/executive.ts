// Executive Dashboard type definitions

export type ExecutiveDimension = 'department' | 'vendor' | 'geo';

export type RiskStatus = 'green' | 'yellow' | 'red';

// Basics
export interface RoleBreakdown {
  vp: number;
  avp: number;
  officer: number;
  sa: number;
}

export interface DirectReport {
  id: string;
  name: string;
  title: string;
  headcount: number;
  employeePct: number;
  contractorPct: number;
  roles: RoleBreakdown;
  locations: string[];
}

export interface BasicsData {
  headcount: number;
  employeePct: number;
  contractorPct: number;
  roles: RoleBreakdown;
  locations: string[];
  directReports: DirectReport[];
}

// Delivery
export interface DeliveryMetric {
  id: string;
  name: string;
  label: string;
  unit: string;
  avg: number;
  min: number;
  max: number;
  median: number;
  orgAvg: number;
  orgMedian: number;
  target?: number;
  status: RiskStatus;
}

export interface DeliveryData {
  metrics: DeliveryMetric[];
}

// Quality & Risk
export interface BusFactorData {
  avg: number;
  min: number;
  max: number;
  median: number;
  status: RiskStatus;
  keyPerson?: string;
}

export interface CodeQualityDist {
  grade: 'A' | 'B' | 'C' | 'D';
  count: number;
  pct: number;
}

export interface QualityData {
  busFactor: BusFactorData;
  codeQuality: CodeQualityDist[];
  slaRate: number;
  slaTarget: number;
  prSuccessRate: number;
  prTarget: number;
}

// Cost-Efficiency
export interface EmployeeVsContractor {
  teamName: string;
  total: number;
  employee: number;
  contractor: number;
  employeePct: number;
}

export interface AIAdoptionSnapshot {
  month: string;
  activeUsers: number;
  activeDays: number;
  codeLines: number;
  velocity: number;
  qualityGrade: string;
}

export interface CostData {
  employeeVsContractor: EmployeeVsContractor[];
  aiAdoption: AIAdoptionSnapshot[];
  aiTargets: {
    activeUsersPct: number;
    activeDays: number;
    codeLines: number;
    velocity: number;
  };
}

// Dimension entity
export interface DimensionEntity {
  id: string;
  name: string;
  title?: string;       // For department (e.g., "CTO", "VP Engineering")
  company?: string;     // For vendor
  location?: string;    // For geo
  headcount: number;
  employeePct: number;
  contractorPct: number;
  basics: BasicsData;
  delivery: DeliveryData;
  quality: QualityData;
  cost: CostData;
}

// Main data structure
export interface ExecutiveData {
  dimension: ExecutiveDimension;
  label: string;
  entities: DimensionEntity[];
  orgSummary: {
    headcount: number;
    employeePct: number;
    contractorPct: number;
  };
}

// Props for ExecutiveDataPage
export interface ExecutiveDataPageProps {
  dimension: ExecutiveDimension;
  onDimensionChange: (dim: ExecutiveDimension) => void;
  showMenu: boolean;
  onReplay: () => void;
  onBack: () => void;
}
