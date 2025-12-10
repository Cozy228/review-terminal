import { forwardRef, useMemo } from 'react';
import { TerminalCommand } from '../components/retro';
import { BasicsSection, DeliverySection, QualitySection, CostSection, CicdSection, JiraSection, CommunitySection } from '../components/exec';
import { executiveMock } from '../data/executiveMock';
import type { ExecutiveDataPageProps, TeamBasicsData, TeamDeliveryData, TeamQualityData, TeamCICDData, TeamJiraData, TeamAIData, Community } from '../types/executive';
import '../styles/retro-game.css';
import '../styles/executive-charts.css';

export const ExecutiveDataPage = forwardRef<HTMLDivElement, ExecutiveDataPageProps>(
  ({ showMenu, onReplay, onBack }, ref) => {
    // Transform DepartmentEntity to section data structures
    const cto = { name: executiveMock.managerName, title: executiveMock.title };

    const basics: TeamBasicsData = useMemo(() => ({
      headcount: executiveMock.headcount,
      employeePct: executiveMock.employeePct,
      contractorPct: executiveMock.contractorPct,
    }), []);

    const delivery: TeamDeliveryData = useMemo(() => ({
      primary: [
        {
          id: 'velocity',
          name: 'Velocity',
          label: 'Velocity',
          unit: ' SP/mo',
          avg: executiveMock.velocity.spPerMonth,
          min: 45,
          max: 62,
          median: 52,
          status: 'green' as const,
        },
        {
          id: 'leadTime',
          name: 'Lead Time',
          label: 'Lead Time',
          unit: ' days',
          avg: executiveMock.velocity.leadTimeDays,
          min: 5,
          max: 12,
          median: 7.5,
          target: 8,
          status: 'green' as const,
        },
        {
          id: 'deployments',
          name: 'Deployments',
          label: 'Deployments',
          unit: '/mo',
          avg: executiveMock.deployment.productionPerMonth,
          min: 45,
          max: 85,
          median: 65,
          target: 60,
          status: 'green' as const,
        },
      ],
      secondary: [
        {
          id: 'commits',
          name: 'Commits',
          label: 'Commits/person',
          unit: '/mo',
          avg: Math.round(executiveMock.commits.monthlyAvg / executiveMock.headcount),
          min: 3,
          max: 8,
          median: 5,
          status: 'green' as const,
        },
        {
          id: 'prSuccess',
          name: 'PR Success',
          label: 'PR Success',
          unit: '%',
          avg: executiveMock.commits.prSuccess,
          min: 85,
          max: 96,
          median: 91,
          target: 90,
          status: 'green' as const,
        },
        {
          id: 'buildSuccess',
          name: 'Build Success',
          label: 'Build Success',
          unit: '%',
          avg: executiveMock.deployment.buildSuccessRate,
          min: 88,
          max: 98,
          median: 95,
          target: 95,
          status: 'green' as const,
        },
      ],
      vendor: {
        id: 'vendor',
        name: 'Vendor Distribution',
        label: 'Resource Mix',
        unit: 'headcount',
        breakdown: [
          {
            name: executiveMock.vendorBenchmarks.ssc.name,
            headcount: 72,
            employeePct: 100,
            performanceScore: 94,
          },
          {
            name: executiveMock.vendorBenchmarks.accenture.name,
            headcount: 15,
            employeePct: 0,
            performanceScore: 87,
          },
          {
            name: executiveMock.vendorBenchmarks.infosys.name,
            headcount: 8,
            employeePct: 0,
            performanceScore: 82,
          },
        ],
        avg: 87,
        min: 82,
        max: 94,
        median: 87,
        status: 'green' as const,
      },
      vendorBenchmarks: executiveMock.vendorBenchmarks,
      monthlyTrends: executiveMock.monthlyTrends,
    }), []);

    const quality: TeamQualityData = useMemo(() => ({
      codeQuality: [
        { grade: 'A', pct: 47 },
        { grade: 'B', pct: 39 },
        { grade: 'C', pct: 12 },
        { grade: 'D', pct: 2 },
      ],
      slaRate: 93,
      slaTarget: 95,
      prSuccessRate: executiveMock.commits.prSuccess,
      prTarget: 95,
    }), []);

    const cicd: TeamCICDData = useMemo(() => ({
      builds: {
        total: 27380,
        successful: 25912,
        failed: 1468,
        successRate: executiveMock.deployment.buildSuccessRate,
      },
      deployments: {
        total: executiveMock.totalDeployments,
        production: executiveMock.productionDeployments,
        staging: executiveMock.totalDeployments - executiveMock.productionDeployments,
      },
      avgBuildTime: executiveMock.deployment.avgBuildTime,
      pipelinesConfigured: 78,
      avg: 94.6,
      min: 88.2,
      max: 98.5,
      median: 95.1,
    }), []);

    const jira: TeamJiraData = useMemo(() => ({
      tickets: {
        total: executiveMock.totalTickets,
        completed: executiveMock.completedTickets,
        inProgress: executiveMock.totalTickets - executiveMock.completedTickets,
        completionRate: 82.2,
      },
      storiesCompleted: 11406,
      bugsFixed: 4898,
      avgCycleTime: '2.4d',
      avgCycleTimeDays: 2.4,
      epicsContributed: 87,
      topProjects: ['Nebula Platform', 'Orion Admin', 'Pulse Metrics', 'Atlas Services', 'Quantum API'],
      avg: 2.4,
      min: 0.8,
      max: 8.5,
      median: 2.2,
    }), []);

    const ai: TeamAIData = useMemo(() => ({
      aiAdoption: [
        { month: 'Jan', activeUsers: 18, activeDays: 8, codeLines: 320, velocity: 38, qualityGrade: 'C' },
        { month: 'Feb', activeUsers: 25, activeDays: 10, codeLines: 450, velocity: 40, qualityGrade: 'C' },
        { month: 'Mar', activeUsers: 35, activeDays: 12, codeLines: 580, velocity: 42, qualityGrade: 'B-' },
        { month: 'Apr', activeUsers: 45, activeDays: 14, codeLines: 710, velocity: 44, qualityGrade: 'B' },
        { month: 'May', activeUsers: 52, activeDays: 16, codeLines: 840, velocity: 46, qualityGrade: 'B' },
        { month: 'Jun', activeUsers: 60, activeDays: 18, codeLines: 960, velocity: 48, qualityGrade: 'B+' },
        { month: 'Jul', activeUsers: 66, activeDays: 19, codeLines: 1050, velocity: 49, qualityGrade: 'A-' },
        { month: 'Aug', activeUsers: 70, activeDays: 21, codeLines: 1120, velocity: 51, qualityGrade: 'A-' },
        { month: 'Sep', activeUsers: 74, activeDays: 22, codeLines: 1160, velocity: 52, qualityGrade: 'A' },
        { month: 'Oct', activeUsers: 76, activeDays: 23, codeLines: 1170, velocity: 53, qualityGrade: 'A' },
        { month: 'Nov', activeUsers: 77, activeDays: 23, codeLines: 1180, velocity: 53, qualityGrade: 'A' },
        { month: 'Dec', activeUsers: 77, activeDays: 23, codeLines: 1180, velocity: 53, qualityGrade: 'A' },
      ],
      aiTargets: {
        activeUsersPct: 80,
        activeDays: 20,
        codeLines: 1000,
        velocity: 50,
      },
      currentAdoption: {
        activeUsers: 77,
        activeUsersPct: 81,
        activeDays: 23,
        codeLines: 1180,
        velocity: 53,
        qualityGrade: 'A',
      },
      acceptanceRate: executiveMock.productivity.acceptanceRate,
    }), []);

    const community: Community = useMemo(() => executiveMock.community, []);

    return (
      <div
        ref={ref}
        className="fixed inset-0 overflow-hidden exec-scroll-wrapper"
        style={{ opacity: 0 }}
      >
        <div className="exec-scroll-content retro-shell scanline" style={{ paddingTop: '48px', paddingBottom: '48px' }}>

          {/* Header Section */}
          <section className="retro-section header-section" style={{ opacity: 0, visibility: 'hidden' }}>
            <div className="section-title">EXECUTIVE DASHBOARD</div>
            <TerminalCommand className="header-command mb-4" text="> initialize --executive --dashboard" />
            <BasicsSection data={basics} ctoName={cto.name} ctoTitle={cto.title} />
          </section>

          {/* Delivery Module */}
          <section className="retro-section delivery-section" style={{ opacity: 0, visibility: 'hidden' }}>
            <div className="section-title">DELIVERY METRICS</div>
            <TerminalCommand className="delivery-command mb-4" text="> analyze --velocity --leadtime --vendors" />
            <DeliverySection data={delivery} />
          </section>

          {/* Quality Module */}
          <section className="retro-section quality-section" style={{ opacity: 0, visibility: 'hidden' }}>
            <div className="section-title">QUALITY METRICS</div>
            <TerminalCommand className="quality-command mb-4" text="> analyze --quality --sla --pr-success" />
            <QualitySection data={quality} />
          </section>

          {/* CI/CD Module */}
          <section className="retro-section cicd-section" style={{ opacity: 0, visibility: 'hidden' }}>
            <div className="section-title">BUILD & DEPLOY</div>
            <TerminalCommand className="cicd-command mb-4" text="> monitor --builds --deployments --pipelines" />
            <CicdSection data={cicd} />
          </section>

          {/* Jira Module */}
          <section className="retro-section jira-section" style={{ opacity: 0, visibility: 'hidden' }}>
            <div className="section-title">PROJECT DELIVERY</div>
            <TerminalCommand className="jira-command mb-4" text="> getdata --jira --tickets --epics" />
            <JiraSection data={jira} />
          </section>

          {/* Community Module */}
          <section className="retro-section community-section" style={{ opacity: 0, visibility: 'hidden' }}>
            <div className="section-title">COMMUNITY & CULTURE</div>
            <TerminalCommand className="community-command mb-4" text="> getdata --community --collaboration" />
            <CommunitySection data={community} />
          </section>

          {/* AI Adoption Module */}
          <section className="retro-section ai-section" style={{ opacity: 0, visibility: 'hidden' }}>
            <div className="section-title">AI ADOPTION</div>
            <TerminalCommand className="ai-command mb-4" text="> analyze --ai --productivity --impact" />
            <CostSection data={ai} />
          </section>

          {/* Summary Section */}
          <section className="retro-section summary-section" style={{ opacity: 0, visibility: 'hidden' }}>
            <div
              className="menu-line exec-menu"
              style={{
                opacity: showMenu ? 1 : 0,
                visibility: showMenu ? 'visible' : 'hidden',
                pointerEvents: showMenu ? 'auto' : 'none',
              }}
            >
              <span onClick={onReplay}>[R]eplay</span>
              <span>[D]ownload PDF</span>
              <span onClick={onBack}>[B]ack to Menu</span>
            </div>
          </section>
        </div>
      </div>
    );
  }
);

ExecutiveDataPage.displayName = 'ExecutiveDataPage';
