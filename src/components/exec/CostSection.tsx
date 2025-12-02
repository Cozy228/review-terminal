import { ASCII_COST } from '../../constants/ascii-executive';
import type { DimensionEntity } from '../../types/executive';

interface CostSectionProps {
  entities: DimensionEntity[];
  dimensionType: 'department' | 'vendor' | 'geo';
}

// Card dimensions for consistent vertical borders
const CARD_WIDTH = 28;
const CARD_INNER = CARD_WIDTH - 2;
const H_LINE = '─'.repeat(CARD_WIDTH);
const CARD_TOP = `┌${H_LINE}┐`;
const CARD_DIVIDER = `├${H_LINE}┤`;
const CARD_BOTTOM = `└${H_LINE}┘`;
const DIVIDER = '__DIVIDER__';

const padLine = (text: string = '') => `│ ${text.slice(0, CARD_INNER).padEnd(CARD_INNER)} │`;
const buildCard = (lines: string[]) => [
  CARD_TOP,
  ...lines.map((line) => line === DIVIDER ? CARD_DIVIDER : padLine(line)),
  CARD_BOTTOM,
].join('\n');

// Block builder for header blocks
const BLOCK_WIDTH = 78;
const BLOCK_INNER = BLOCK_WIDTH - 2;
const BLOCK_TOP = `┌${'─'.repeat(BLOCK_WIDTH)}┐`;
const BLOCK_BOTTOM = `└${'─'.repeat(BLOCK_WIDTH)}┘`;
const padBlock = (text: string = '') => `│ ${text.slice(0, BLOCK_INNER).padEnd(BLOCK_INNER)} │`;
const buildBlock = (lines: string[]) => [BLOCK_TOP, ...lines.map(padBlock), BLOCK_BOTTOM].join('\n');

// Get entity label
const getLabel = (e: DimensionEntity, dim: string) => {
  if (dim === 'vendor') return e.company || e.name;
  if (dim === 'geo') return e.location || e.name;
  return e.name;
};

// ASCII bar
const asciiBar = (pct: number, width: number = 12): string => {
  const filled = Math.round((pct / 100) * width);
  return '█'.repeat(Math.max(0, filled)) + '░'.repeat(Math.max(0, width - filled));
};

// Simple ASCII sparkline for trend
const sparkline = (values: number[], max: number): string => {
  const chars = '▁▂▃▄▅▆▇█';
  return values.map(v => {
    const idx = Math.min(7, Math.floor((v / max) * 8));
    return chars[idx];
  }).join('');
};

export const CostSection = ({ entities, dimensionType }: CostSectionProps) => {
  // Calculate org totals
  const orgTotal = entities.reduce((sum, e) => sum + e.headcount, 0);
  
  // Calculate org-wide AI adoption trends
  const orgAI = {
    activeUsers: entities.reduce((sum, e) => sum + (e.cost.aiAdoption[11]?.activeUsers || 0), 0),
    velocity: entities.reduce((sum, e) => sum + (e.cost.aiAdoption[11]?.velocity || 0), 0) / entities.length,
    codeLines: entities.reduce((sum, e) => sum + (e.cost.aiAdoption[11]?.codeLines || 0), 0) / entities.length,
  };
  const orgAdoptionPct = Math.round((orgAI.activeUsers / orgTotal) * 100);

  // Get velocity trends for sparkline
  const getVelocityTrend = (e: DimensionEntity) => e.cost.aiAdoption.map(a => a.velocity);
  const getCodeLinesTrend = (e: DimensionEntity) => e.cost.aiAdoption.map(a => a.codeLines);

  return (
    <div className="exec-section">
      {/* ASCII Section Header */}
      <pre className="exec-ascii-title" style={{ color: 'var(--accent-error)' }}>
{ASCII_COST}
      </pre>

      {/* AI Adoption Overview */}
      <pre className="exec-ascii-block">
        {buildBlock([
          `AI Adoption Impact - Full Year 2025`.padEnd(48, '─'),
          `Org Active Users: ${String(orgAI.activeUsers).padEnd(3)}/${orgTotal} (${orgAdoptionPct}%)  │  Target: >=80%`,
          `Avg Velocity: ${String(Math.round(orgAI.velocity)).padEnd(4)} SP  │  Avg Code Lines: ${String(Math.round(orgAI.codeLines)).padEnd(5)}`,
        ])}
      </pre>

      {/* Org-wide Trend Charts */}
      <pre className="exec-ascii-block" style={{ color: 'var(--accent-info)' }}>
        {buildBlock([
          `Organization Trends (Jan -> Dec)`.padEnd(48, '─'),
          '',
          `Velocity     ${sparkline(entities[0]?.cost.aiAdoption.map(a => a.velocity) || [], 80)}  32 SP -> ${Math.round(orgAI.velocity)} SP (+${Math.round((orgAI.velocity / 32 - 1) * 100)}%)`,
          `(SP/month)   Jan─────────────────────Dec`,
          '',
          `Code Lines   ${sparkline(entities[0]?.cost.aiAdoption.map(a => a.codeLines) || [], 2000)}  300 -> ${Math.round(orgAI.codeLines)} (+${Math.round((orgAI.codeLines / 300 - 1) * 100)}%)`,
          `(per user)   Jan─────────────────────Dec`,
          '',
          `Quality      C -> C -> B- -> B -> B -> B+ -> A- -> A- -> A -> A -> A -> A`,
          `Grade        Jan─────────────────────Dec`,
          '',
        ])}
      </pre>

      {/* Per-entity breakdown */}
      <pre className="exec-ascii-block">
        {buildBlock([
          `Team AI Adoption Breakdown`.padEnd(52, '─'),
          `Active Users │ Velocity Trend │ Code Lines │ Quality`,
        ])}
      </pre>

      <div className="exec-ascii-cards">
        {entities.map((entity) => {
          const jan = entity.cost.aiAdoption[0];
          const dec = entity.cost.aiAdoption[11];
          const label = getLabel(entity, dimensionType);
          const adoptionPct = dec ? Math.round((dec.activeUsers / entity.headcount) * 100) : 0;
          const velGain = jan && dec ? Math.round(((dec.velocity - jan.velocity) / jan.velocity) * 100) : 0;
          const locGain = jan && dec ? Math.round(((dec.codeLines - jan.codeLines) / jan.codeLines) * 100) : 0;
          const adoptIcon = adoptionPct >= 80 ? '[G]' : adoptionPct >= 60 ? '[Y]' : '[R]';

          const lines = [
            label,
            `(${entity.headcount} people)`,
            DIVIDER,
            `Users: ${adoptIcon} ${String(dec?.activeUsers || 0).padEnd(2)}/${entity.headcount} (${String(adoptionPct).padStart(2)}%)`,
            `[${asciiBar(adoptionPct, 14)}]`,
            DIVIDER,
            `Velocity: ${sparkline(getVelocityTrend(entity), 80)}`,
            `${String(jan?.velocity || 0).padEnd(4)}→${String(dec?.velocity || 0).padEnd(4)} SP (+${velGain}%)`,
            DIVIDER,
            `Code/usr: ${sparkline(getCodeLinesTrend(entity), 2000)}`,
            `${String(jan?.codeLines || 0).padEnd(4)}→${String(dec?.codeLines || 0).padEnd(4)} (+${locGain}%)`,
            DIVIDER,
            `Quality: ${jan?.qualityGrade || 'C'}→${dec?.qualityGrade || 'A'}`,
          ];

          return (
            <pre key={entity.id} className="exec-ascii-card">
              {buildCard(lines)}
            </pre>
          );
        })}
      </div>

      {/* Analysis */}
      <pre className="exec-ascii-block" style={{ color: 'var(--text-secondary)' }}>
        {buildBlock([
          `Analysis`.padEnd(70, '─'),
          '',
          `Trend: Jan-Mar slow ramp -> Apr-Jun acceleration -> Jul-Sep peak`,
          `       -> Oct-Dec sustained productivity`,
          '',
          `Clear correlation between AI adoption and velocity gains`,
          `Code quality improved alongside productivity (C -> A)`,
          `Teams with higher adoption show 40-60% velocity improvement`,
          '',
          `Recommendations:`,
          `• Continue AI tooling investment - clear ROI demonstrated`,
          `• Target 90% adoption for all teams by Q2 2026`,
          `• Focus enablement on lower-adoption teams`,
          '',
        ])}
      </pre>
    </div>
  );
};
