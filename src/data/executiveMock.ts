import type { ExecutiveData, DimensionEntity, AIAdoptionSnapshot } from '../types/executive';

// Helper to generate AI adoption monthly data
const generateAIAdoption = (baseUsers: number, baseDays: number, baseLines: number, baseVelocity: number): AIAdoptionSnapshot[] => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const grades = ['C', 'C', 'B-', 'B', 'B', 'B+', 'A-', 'A-', 'A', 'A', 'A', 'A'];
  
  return months.map((month, i) => {
    const progress = (i + 1) / 12;
    const rampUp = Math.min(1, progress * 1.5); // Faster ramp in first half
    return {
      month,
      activeUsers: Math.round(baseUsers * (0.2 + 0.8 * rampUp)),
      activeDays: Math.round(baseDays * (0.3 + 0.7 * rampUp)),
      codeLines: Math.round(baseLines * (0.25 + 0.75 * rampUp)),
      velocity: Math.round(baseVelocity * (0.7 + 0.3 * rampUp) * 10) / 10,
      qualityGrade: grades[i],
    };
  });
};

// Department dimension data (CTO's direct reports)
const departmentEntities: DimensionEntity[] = [
  {
    id: 'vp-eng',
    name: 'Alice Chen',
    title: 'VP Engineering',
    headcount: 45,
    employeePct: 78,
    contractorPct: 22,
    basics: {
      headcount: 45,
      employeePct: 78,
      contractorPct: 22,
      roles: { vp: 2, avp: 5, officer: 18, sa: 20 },
      locations: ['Boston (25)', 'NYC (12)', 'Remote (8)'],
      directReports: [],
    },
    delivery: {
      metrics: [
        { id: 'leadTime', name: 'Lead Time', label: 'Lead Time', unit: 'days', avg: 8.2, min: 4.2, max: 12.5, median: 7.9, orgAvg: 8.5, orgMedian: 7.8, target: 7, status: 'yellow' },
        { id: 'velocity', name: 'Velocity', label: 'Velocity', unit: 'SP/mo', avg: 55.2, min: 42, max: 65, median: 53.5, orgAvg: 52, orgMedian: 50.5, status: 'green' },
        { id: 'commits', name: 'Commits', label: 'Commits/person', unit: '/mo', avg: 48, min: 25, max: 72, median: 45, orgAvg: 42, orgMedian: 40, status: 'green' },
        { id: 'loc', name: 'LOC', label: 'LOC/person', unit: '/mo', avg: 1245, min: 650, max: 2100, median: 1180, orgAvg: 1100, orgMedian: 1050, status: 'green' },
        { id: 'deployFreq', name: 'Deploy Freq', label: 'Deploys', unit: '/mo', avg: 6.2, min: 4, max: 12, median: 5.5, orgAvg: 5.0, orgMedian: 4.8, target: 4, status: 'green' },
        { id: 'prMergeTime', name: 'PR Merge Time', label: 'PR Merge', unit: 'hrs', avg: 18, min: 4, max: 36, median: 16, orgAvg: 24, orgMedian: 22, status: 'green' },
      ],
    },
    quality: {
      busFactor: { avg: 74, min: 65, max: 82, median: 73, status: 'red', keyPerson: 'Alice' },
      codeQuality: [
        { grade: 'A', count: 25, pct: 55 },
        { grade: 'B', count: 16, pct: 35 },
        { grade: 'C', count: 4, pct: 8 },
        { grade: 'D', count: 0, pct: 2 },
      ],
      slaRate: 96,
      slaTarget: 95,
      prSuccessRate: 97,
      prTarget: 95,
    },
    cost: {
      employeeVsContractor: [
        { teamName: 'VP Engineering', total: 45, employee: 35, contractor: 10, employeePct: 78 },
      ],
      aiAdoption: generateAIAdoption(37, 24.6, 1245, 56.2),
      aiTargets: { activeUsersPct: 80, activeDays: 20, codeLines: 1000, velocity: 50 },
    },
  },
  {
    id: 'vp-product',
    name: 'Bob Wilson',
    title: 'VP Product',
    headcount: 32,
    employeePct: 65,
    contractorPct: 35,
    basics: {
      headcount: 32,
      employeePct: 65,
      contractorPct: 35,
      roles: { vp: 1, avp: 2, officer: 10, sa: 19 },
      locations: ['Boston (18)', 'London (8)', 'Remote (6)'],
      directReports: [],
    },
    delivery: {
      metrics: [
        { id: 'leadTime', name: 'Lead Time', label: 'Lead Time', unit: 'days', avg: 8.8, min: 5.1, max: 14.2, median: 8.5, orgAvg: 8.5, orgMedian: 7.8, target: 7, status: 'yellow' },
        { id: 'velocity', name: 'Velocity', label: 'Velocity', unit: 'SP/mo', avg: 48.3, min: 35, max: 62, median: 47, orgAvg: 52, orgMedian: 50.5, status: 'yellow' },
        { id: 'commits', name: 'Commits', label: 'Commits/person', unit: '/mo', avg: 38, min: 18, max: 58, median: 36, orgAvg: 42, orgMedian: 40, status: 'yellow' },
        { id: 'loc', name: 'LOC', label: 'LOC/person', unit: '/mo', avg: 892, min: 420, max: 1450, median: 850, orgAvg: 1100, orgMedian: 1050, status: 'yellow' },
        { id: 'deployFreq', name: 'Deploy Freq', label: 'Deploys', unit: '/mo', avg: 4.5, min: 2, max: 8, median: 4, orgAvg: 5.0, orgMedian: 4.8, target: 4, status: 'green' },
        { id: 'prMergeTime', name: 'PR Merge Time', label: 'PR Merge', unit: 'hrs', avg: 32, min: 8, max: 52, median: 28, orgAvg: 24, orgMedian: 22, status: 'red' },
      ],
    },
    quality: {
      busFactor: { avg: 58, min: 42, max: 71, median: 59, status: 'green' },
      codeQuality: [
        { grade: 'A', count: 8, pct: 25 },
        { grade: 'B', count: 16, pct: 50 },
        { grade: 'C', count: 6, pct: 20 },
        { grade: 'D', count: 2, pct: 5 },
      ],
      slaRate: 91,
      slaTarget: 95,
      prSuccessRate: 89,
      prTarget: 95,
    },
    cost: {
      employeeVsContractor: [
        { teamName: 'VP Product', total: 32, employee: 21, contractor: 11, employeePct: 65 },
      ],
      aiAdoption: generateAIAdoption(24, 22.5, 892, 48.5),
      aiTargets: { activeUsersPct: 80, activeDays: 20, codeLines: 1000, velocity: 50 },
    },
  },
  {
    id: 'vp-infra',
    name: 'Carol Martinez',
    title: 'VP Infra & DevOps',
    headcount: 18,
    employeePct: 89,
    contractorPct: 11,
    basics: {
      headcount: 18,
      employeePct: 89,
      contractorPct: 11,
      roles: { vp: 1, avp: 3, officer: 7, sa: 7 },
      locations: ['Boston (10)', 'Denver (5)', 'Remote (3)'],
      directReports: [],
    },
    delivery: {
      metrics: [
        { id: 'leadTime', name: 'Lead Time', label: 'Lead Time', unit: 'days', avg: 6.5, min: 2.8, max: 9.5, median: 6.1, orgAvg: 8.5, orgMedian: 7.8, target: 7, status: 'green' },
        { id: 'velocity', name: 'Velocity', label: 'Velocity', unit: 'SP/mo', avg: 57.1, min: 44, max: 71.5, median: 55.2, orgAvg: 52, orgMedian: 50.5, status: 'green' },
        { id: 'commits', name: 'Commits', label: 'Commits/person', unit: '/mo', avg: 52, min: 32, max: 78, median: 50, orgAvg: 42, orgMedian: 40, status: 'green' },
        { id: 'loc', name: 'LOC', label: 'LOC/person', unit: '/mo', avg: 1524, min: 820, max: 2350, median: 1480, orgAvg: 1100, orgMedian: 1050, status: 'green' },
        { id: 'deployFreq', name: 'Deploy Freq', label: 'Deploys', unit: '/mo', avg: 8.5, min: 6, max: 15, median: 8, orgAvg: 5.0, orgMedian: 4.8, target: 4, status: 'green' },
        { id: 'prMergeTime', name: 'PR Merge Time', label: 'PR Merge', unit: 'hrs', avg: 14, min: 2, max: 28, median: 12, orgAvg: 24, orgMedian: 22, status: 'green' },
      ],
    },
    quality: {
      busFactor: { avg: 68, min: 55, max: 78, median: 67, status: 'yellow', keyPerson: 'Carol' },
      codeQuality: [
        { grade: 'A', count: 12, pct: 67 },
        { grade: 'B', count: 5, pct: 28 },
        { grade: 'C', count: 1, pct: 5 },
        { grade: 'D', count: 0, pct: 0 },
      ],
      slaRate: 94,
      slaTarget: 95,
      prSuccessRate: 93,
      prTarget: 95,
    },
    cost: {
      employeeVsContractor: [
        { teamName: 'VP Infra', total: 18, employee: 16, contractor: 2, employeePct: 89 },
      ],
      aiAdoption: generateAIAdoption(16, 24.6, 1524, 58.5),
      aiTargets: { activeUsersPct: 80, activeDays: 20, codeLines: 1000, velocity: 50 },
    },
  },
];

// Vendor dimension data (by company) - SSC = internal employees, others are contractors
const vendorEntities: DimensionEntity[] = [
  {
    id: 'vendor-ssc',
    name: 'SSC',
    company: 'SSC (Internal)',
    headcount: 72,
    employeePct: 100,
    contractorPct: 0,
    basics: {
      headcount: 72,
      employeePct: 100,
      contractorPct: 0,
      roles: { vp: 4, avp: 10, officer: 28, sa: 30 },
      locations: ['Boston (43)', 'NYC (12)', 'London (5)', 'Remote (12)'],
      directReports: [],
    },
    delivery: {
      metrics: [
        { id: 'leadTime', name: 'Lead Time', label: 'Lead Time', unit: 'days', avg: 7.8, min: 3.2, max: 12, median: 7.5, orgAvg: 8.5, orgMedian: 7.8, target: 7, status: 'yellow' },
        { id: 'velocity', name: 'Velocity', label: 'Velocity', unit: 'SP/mo', avg: 54.5, min: 40, max: 68, median: 53, orgAvg: 52, orgMedian: 50.5, status: 'green' },
        { id: 'commits', name: 'Commits', label: 'Commits/person', unit: '/mo', avg: 46, min: 22, max: 72, median: 44, orgAvg: 42, orgMedian: 40, status: 'green' },
        { id: 'loc', name: 'LOC', label: 'LOC/person', unit: '/mo', avg: 1180, min: 520, max: 2100, median: 1120, orgAvg: 1100, orgMedian: 1050, status: 'green' },
      ],
    },
    quality: {
      busFactor: { avg: 65, min: 48, max: 82, median: 64, status: 'yellow' },
      codeQuality: [
        { grade: 'A', count: 38, pct: 53 },
        { grade: 'B', count: 25, pct: 35 },
        { grade: 'C', count: 7, pct: 10 },
        { grade: 'D', count: 2, pct: 2 },
      ],
      slaRate: 95,
      slaTarget: 95,
      prSuccessRate: 94,
      prTarget: 95,
    },
    cost: {
      employeeVsContractor: [
        { teamName: 'SSC', total: 72, employee: 72, contractor: 0, employeePct: 100 },
      ],
      aiAdoption: generateAIAdoption(60, 23, 1180, 54.5),
      aiTargets: { activeUsersPct: 80, activeDays: 20, codeLines: 1000, velocity: 50 },
    },
  },
  {
    id: 'vendor-accenture',
    name: 'Accenture',
    company: 'Accenture',
    headcount: 12,
    employeePct: 0,
    contractorPct: 100,
    basics: {
      headcount: 12,
      employeePct: 0,
      contractorPct: 100,
      roles: { vp: 0, avp: 1, officer: 4, sa: 7 },
      locations: ['Boston (8)', 'NYC (4)'],
      directReports: [],
    },
    delivery: {
      metrics: [
        { id: 'leadTime', name: 'Lead Time', label: 'Lead Time', unit: 'days', avg: 9.2, min: 5.5, max: 14, median: 8.8, orgAvg: 8.5, orgMedian: 7.8, target: 7, status: 'red' },
        { id: 'velocity', name: 'Velocity', label: 'Velocity', unit: 'SP/mo', avg: 45.2, min: 32, max: 58, median: 44, orgAvg: 52, orgMedian: 50.5, status: 'yellow' },
        { id: 'commits', name: 'Commits', label: 'Commits/person', unit: '/mo', avg: 35, min: 18, max: 52, median: 33, orgAvg: 42, orgMedian: 40, status: 'yellow' },
        { id: 'loc', name: 'LOC', label: 'LOC/person', unit: '/mo', avg: 920, min: 450, max: 1380, median: 880, orgAvg: 1100, orgMedian: 1050, status: 'yellow' },
      ],
    },
    quality: {
      busFactor: { avg: 62, min: 48, max: 75, median: 60, status: 'green' },
      codeQuality: [
        { grade: 'A', count: 3, pct: 25 },
        { grade: 'B', count: 6, pct: 50 },
        { grade: 'C', count: 2, pct: 17 },
        { grade: 'D', count: 1, pct: 8 },
      ],
      slaRate: 88,
      slaTarget: 95,
      prSuccessRate: 85,
      prTarget: 95,
    },
    cost: {
      employeeVsContractor: [
        { teamName: 'Accenture', total: 12, employee: 0, contractor: 12, employeePct: 0 },
      ],
      aiAdoption: generateAIAdoption(8, 18, 920, 45.2),
      aiTargets: { activeUsersPct: 80, activeDays: 20, codeLines: 1000, velocity: 50 },
    },
  },
  {
    id: 'vendor-infosys',
    name: 'Infosys',
    company: 'Infosys',
    headcount: 8,
    employeePct: 0,
    contractorPct: 100,
    basics: {
      headcount: 8,
      employeePct: 0,
      contractorPct: 100,
      roles: { vp: 0, avp: 0, officer: 3, sa: 5 },
      locations: ['Bangalore (5)', 'Boston (3)'],
      directReports: [],
    },
    delivery: {
      metrics: [
        { id: 'leadTime', name: 'Lead Time', label: 'Lead Time', unit: 'days', avg: 10.5, min: 6, max: 16, median: 10, orgAvg: 8.5, orgMedian: 7.8, target: 7, status: 'red' },
        { id: 'velocity', name: 'Velocity', label: 'Velocity', unit: 'SP/mo', avg: 42.8, min: 28, max: 55, median: 41, orgAvg: 52, orgMedian: 50.5, status: 'yellow' },
        { id: 'commits', name: 'Commits', label: 'Commits/person', unit: '/mo', avg: 32, min: 15, max: 48, median: 30, orgAvg: 42, orgMedian: 40, status: 'yellow' },
        { id: 'loc', name: 'LOC', label: 'LOC/person', unit: '/mo', avg: 850, min: 380, max: 1250, median: 820, orgAvg: 1100, orgMedian: 1050, status: 'yellow' },
      ],
    },
    quality: {
      busFactor: { avg: 55, min: 40, max: 68, median: 54, status: 'green' },
      codeQuality: [
        { grade: 'A', count: 1, pct: 12 },
        { grade: 'B', count: 4, pct: 50 },
        { grade: 'C', count: 2, pct: 25 },
        { grade: 'D', count: 1, pct: 13 },
      ],
      slaRate: 85,
      slaTarget: 95,
      prSuccessRate: 82,
      prTarget: 95,
    },
    cost: {
      employeeVsContractor: [
        { teamName: 'Infosys', total: 8, employee: 0, contractor: 8, employeePct: 0 },
      ],
      aiAdoption: generateAIAdoption(5, 16, 850, 42.8),
      aiTargets: { activeUsersPct: 80, activeDays: 20, codeLines: 1000, velocity: 50 },
    },
  },
  {
    id: 'vendor-tcs',
    name: 'TCS',
    company: 'Tata Consultancy Services',
    headcount: 3,
    employeePct: 0,
    contractorPct: 100,
    basics: {
      headcount: 3,
      employeePct: 0,
      contractorPct: 100,
      roles: { vp: 0, avp: 0, officer: 1, sa: 2 },
      locations: ['Mumbai (2)', 'Boston (1)'],
      directReports: [],
    },
    delivery: {
      metrics: [
        { id: 'leadTime', name: 'Lead Time', label: 'Lead Time', unit: 'days', avg: 8.8, min: 5, max: 12, median: 8.5, orgAvg: 8.5, orgMedian: 7.8, target: 7, status: 'yellow' },
        { id: 'velocity', name: 'Velocity', label: 'Velocity', unit: 'SP/mo', avg: 48.5, min: 38, max: 58, median: 49, orgAvg: 52, orgMedian: 50.5, status: 'yellow' },
        { id: 'commits', name: 'Commits', label: 'Commits/person', unit: '/mo', avg: 40, min: 28, max: 52, median: 40, orgAvg: 42, orgMedian: 40, status: 'green' },
        { id: 'loc', name: 'LOC', label: 'LOC/person', unit: '/mo', avg: 1050, min: 720, max: 1380, median: 1050, orgAvg: 1100, orgMedian: 1050, status: 'green' },
      ],
    },
    quality: {
      busFactor: { avg: 72, min: 65, max: 78, median: 73, status: 'yellow' },
      codeQuality: [
        { grade: 'A', count: 1, pct: 33 },
        { grade: 'B', count: 2, pct: 67 },
        { grade: 'C', count: 0, pct: 0 },
        { grade: 'D', count: 0, pct: 0 },
      ],
      slaRate: 92,
      slaTarget: 95,
      prSuccessRate: 90,
      prTarget: 95,
    },
    cost: {
      employeeVsContractor: [
        { teamName: 'TCS', total: 3, employee: 0, contractor: 3, employeePct: 0 },
      ],
      aiAdoption: generateAIAdoption(2, 20, 1050, 48.5),
      aiTargets: { activeUsersPct: 80, activeDays: 20, codeLines: 1000, velocity: 50 },
    },
  },
];

// Geographic dimension data (by location)
const geoEntities: DimensionEntity[] = [
  {
    id: 'geo-boston',
    name: 'Boston',
    location: 'Boston, MA',
    headcount: 53,
    employeePct: 81,
    contractorPct: 19,
    basics: {
      headcount: 53,
      employeePct: 81,
      contractorPct: 19,
      roles: { vp: 3, avp: 6, officer: 22, sa: 22 },
      locations: ['Boston HQ'],
      directReports: [],
    },
    delivery: {
      metrics: [
        { id: 'leadTime', name: 'Lead Time', label: 'Lead Time', unit: 'days', avg: 7.8, min: 3.5, max: 12, median: 7.5, orgAvg: 8.5, orgMedian: 7.8, target: 7, status: 'yellow' },
        { id: 'velocity', name: 'Velocity', label: 'Velocity', unit: 'SP/mo', avg: 54.5, min: 40, max: 68, median: 53, orgAvg: 52, orgMedian: 50.5, status: 'green' },
        { id: 'commits', name: 'Commits', label: 'Commits/person', unit: '/mo', avg: 46, min: 22, max: 70, median: 44, orgAvg: 42, orgMedian: 40, status: 'green' },
      ],
    },
    quality: {
      busFactor: { avg: 65, min: 48, max: 80, median: 64, status: 'yellow' },
      codeQuality: [
        { grade: 'A', count: 28, pct: 53 },
        { grade: 'B', count: 18, pct: 34 },
        { grade: 'C', count: 5, pct: 9 },
        { grade: 'D', count: 2, pct: 4 },
      ],
      slaRate: 94,
      slaTarget: 95,
      prSuccessRate: 94,
      prTarget: 95,
    },
    cost: {
      employeeVsContractor: [
        { teamName: 'Boston', total: 53, employee: 43, contractor: 10, employeePct: 81 },
      ],
      aiAdoption: generateAIAdoption(44, 23, 1180, 54.5),
      aiTargets: { activeUsersPct: 80, activeDays: 20, codeLines: 1000, velocity: 50 },
    },
  },
  {
    id: 'geo-nyc',
    name: 'New York',
    location: 'New York, NY',
    headcount: 16,
    employeePct: 75,
    contractorPct: 25,
    basics: {
      headcount: 16,
      employeePct: 75,
      contractorPct: 25,
      roles: { vp: 1, avp: 2, officer: 6, sa: 7 },
      locations: ['NYC Office'],
      directReports: [],
    },
    delivery: {
      metrics: [
        { id: 'leadTime', name: 'Lead Time', label: 'Lead Time', unit: 'days', avg: 8.2, min: 4.5, max: 13, median: 7.8, orgAvg: 8.5, orgMedian: 7.8, target: 7, status: 'yellow' },
        { id: 'velocity', name: 'Velocity', label: 'Velocity', unit: 'SP/mo', avg: 50.2, min: 38, max: 62, median: 49, orgAvg: 52, orgMedian: 50.5, status: 'yellow' },
        { id: 'commits', name: 'Commits', label: 'Commits/person', unit: '/mo', avg: 40, min: 20, max: 58, median: 38, orgAvg: 42, orgMedian: 40, status: 'yellow' },
      ],
    },
    quality: {
      busFactor: { avg: 70, min: 55, max: 82, median: 69, status: 'yellow' },
      codeQuality: [
        { grade: 'A', count: 6, pct: 37 },
        { grade: 'B', count: 7, pct: 44 },
        { grade: 'C', count: 2, pct: 13 },
        { grade: 'D', count: 1, pct: 6 },
      ],
      slaRate: 92,
      slaTarget: 95,
      prSuccessRate: 91,
      prTarget: 95,
    },
    cost: {
      employeeVsContractor: [
        { teamName: 'NYC', total: 16, employee: 12, contractor: 4, employeePct: 75 },
      ],
      aiAdoption: generateAIAdoption(12, 21, 1020, 50.2),
      aiTargets: { activeUsersPct: 80, activeDays: 20, codeLines: 1000, velocity: 50 },
    },
  },
  {
    id: 'geo-london',
    name: 'London',
    location: 'London, UK',
    headcount: 8,
    employeePct: 62,
    contractorPct: 38,
    basics: {
      headcount: 8,
      employeePct: 62,
      contractorPct: 38,
      roles: { vp: 0, avp: 1, officer: 3, sa: 4 },
      locations: ['London Office'],
      directReports: [],
    },
    delivery: {
      metrics: [
        { id: 'leadTime', name: 'Lead Time', label: 'Lead Time', unit: 'days', avg: 9.5, min: 5, max: 15, median: 9, orgAvg: 8.5, orgMedian: 7.8, target: 7, status: 'red' },
        { id: 'velocity', name: 'Velocity', label: 'Velocity', unit: 'SP/mo', avg: 47.8, min: 35, max: 58, median: 46, orgAvg: 52, orgMedian: 50.5, status: 'yellow' },
        { id: 'commits', name: 'Commits', label: 'Commits/person', unit: '/mo', avg: 36, min: 18, max: 52, median: 34, orgAvg: 42, orgMedian: 40, status: 'yellow' },
      ],
    },
    quality: {
      busFactor: { avg: 72, min: 58, max: 85, median: 71, status: 'yellow' },
      codeQuality: [
        { grade: 'A', count: 2, pct: 25 },
        { grade: 'B', count: 4, pct: 50 },
        { grade: 'C', count: 1, pct: 12 },
        { grade: 'D', count: 1, pct: 13 },
      ],
      slaRate: 89,
      slaTarget: 95,
      prSuccessRate: 88,
      prTarget: 95,
    },
    cost: {
      employeeVsContractor: [
        { teamName: 'London', total: 8, employee: 5, contractor: 3, employeePct: 62 },
      ],
      aiAdoption: generateAIAdoption(6, 19, 920, 47.8),
      aiTargets: { activeUsersPct: 80, activeDays: 20, codeLines: 1000, velocity: 50 },
    },
  },
  {
    id: 'geo-remote',
    name: 'Remote',
    location: 'Remote (Various)',
    headcount: 18,
    employeePct: 72,
    contractorPct: 28,
    basics: {
      headcount: 18,
      employeePct: 72,
      contractorPct: 28,
      roles: { vp: 0, avp: 1, officer: 4, sa: 13 },
      locations: ['US Remote (12)', 'EMEA Remote (4)', 'APAC Remote (2)'],
      directReports: [],
    },
    delivery: {
      metrics: [
        { id: 'leadTime', name: 'Lead Time', label: 'Lead Time', unit: 'days', avg: 9.2, min: 4, max: 16, median: 8.8, orgAvg: 8.5, orgMedian: 7.8, target: 7, status: 'red' },
        { id: 'velocity', name: 'Velocity', label: 'Velocity', unit: 'SP/mo', avg: 52.5, min: 38, max: 68, median: 51, orgAvg: 52, orgMedian: 50.5, status: 'green' },
        { id: 'commits', name: 'Commits', label: 'Commits/person', unit: '/mo', avg: 44, min: 22, max: 65, median: 42, orgAvg: 42, orgMedian: 40, status: 'green' },
      ],
    },
    quality: {
      busFactor: { avg: 58, min: 42, max: 72, median: 57, status: 'green' },
      codeQuality: [
        { grade: 'A', count: 9, pct: 50 },
        { grade: 'B', count: 6, pct: 33 },
        { grade: 'C', count: 3, pct: 17 },
        { grade: 'D', count: 0, pct: 0 },
      ],
      slaRate: 93,
      slaTarget: 95,
      prSuccessRate: 92,
      prTarget: 95,
    },
    cost: {
      employeeVsContractor: [
        { teamName: 'Remote', total: 18, employee: 13, contractor: 5, employeePct: 72 },
      ],
      aiAdoption: generateAIAdoption(15, 22, 1150, 52.5),
      aiTargets: { activeUsersPct: 80, activeDays: 20, codeLines: 1000, velocity: 50 },
    },
  },
];

// Export data by dimension
export const executiveDataByDimension: Record<string, ExecutiveData> = {
  department: {
    dimension: 'department',
    label: 'Department',
    entities: departmentEntities,
    orgSummary: { headcount: 95, employeePct: 76, contractorPct: 24 },
  },
  vendor: {
    dimension: 'vendor',
    label: 'Vendor',
    entities: vendorEntities,
    orgSummary: { headcount: 23, employeePct: 0, contractorPct: 100 },
  },
  geo: {
    dimension: 'geo',
    label: 'Geographic',
    entities: geoEntities,
    orgSummary: { headcount: 95, employeePct: 76, contractorPct: 24 },
  },
};

// CTO data for header
export const ctoData = {
  name: 'John Smith',
  title: 'CTO',
  headcount: 95,
  employeePct: 76,
  contractorPct: 24,
};
