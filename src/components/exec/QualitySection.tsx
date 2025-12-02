import { ASCII_QUALITY } from '../../constants/ascii-executive';
import type { DimensionEntity } from '../../types/executive';

interface QualitySectionProps {
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

// Block builder for section headers
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

// Status indicator
const statusIcon = (status: string): string => {
  switch (status) {
    case 'green': return '[G]';
    case 'red': return '[R]';
    default: return '[Y]';
  }
};

// Bus factor status
const bfStatus = (pct: number) => {
  if (pct > 75) return { icon: '[R]', text: 'At Risk' };
  if (pct >= 65) return { icon: '[Y]', text: 'Caution' };
  return { icon: '[G]', text: 'Healthy' };
};

export const QualitySection = ({ entities, dimensionType }: QualitySectionProps) => {
  return (
    <div className="exec-section">
      {/* ASCII Section Header */}
      <pre className="exec-ascii-title" style={{ color: 'var(--accent-warning)' }}>
{ASCII_QUALITY}
      </pre>

      {/* Bus Factor Section */}
      <pre className="exec-ascii-block">
        {buildBlock([
          `Bus Factor: Key Knowledge Distribution Risk (%)`.padEnd(54, '─'),
          `Org Avg: 62%  │  Healthy: <65%  │  Caution: 65-75%  │  At Risk: >75%`,
        ])}
      </pre>
      
      <div className="exec-ascii-cards">
        {entities.map((entity) => {
          const bf = entity.quality.busFactor;
          const label = getLabel(entity, dimensionType);
          const status = bfStatus(bf.avg);

          const lines = [
            label,
            `${status.icon} ${String(bf.avg).padEnd(3)}%`,
          ];

          if (bf.keyPerson) {
            lines.push(`Key: ${bf.keyPerson.substring(0, 20)}`);
          }

          lines.push(
            DIVIDER,
            `[${asciiBar(bf.avg, 14)}] ${String(bf.avg).padStart(3)}%`,
            `(${status.text})`,
            DIVIDER,
            `Min:${String(bf.min).padEnd(3)} Max:${String(bf.max).padEnd(3)}`,
            `Med:${String(bf.median).padEnd(3)} Avg:${String(bf.avg).padEnd(3)}`
          );

          return (
            <pre key={entity.id} className="exec-ascii-card">
              {buildCard(lines)}
            </pre>
          );
        })}
      </div>

      {/* Code Quality Section */}
      <pre className="exec-ascii-block">
        {buildBlock([
          `Code Quality Grade Distribution (A/B/C/D)`.padEnd(47, '─'),
          `Org Avg: B  │  Target: A+B >=80%`,
        ])}
      </pre>
      
      <div className="exec-ascii-cards">
        {entities.map((entity) => {
          const cq = entity.quality.codeQuality;
          const label = getLabel(entity, dimensionType);
          const gradeA = cq.find(g => g.grade === 'A');
          const gradeB = cq.find(g => g.grade === 'B');
          const gradeC = cq.find(g => g.grade === 'C');
          const gradeD = cq.find(g => g.grade === 'D');
          const abTotal = (gradeA?.pct || 0) + (gradeB?.pct || 0);
          const abStatus = abTotal >= 80 ? '[G]' : abTotal >= 65 ? '[Y]' : '[R]';

          const lines = [
            label,
            `${abStatus} A+B: ${String(abTotal).padEnd(3)}%`,
            DIVIDER,
            `A ${asciiBar(gradeA?.pct || 0, 10)} ${String(gradeA?.pct || 0).padStart(2)}% (${String(gradeA?.count || 0).padEnd(2)})`,
            `B ${asciiBar(gradeB?.pct || 0, 10)} ${String(gradeB?.pct || 0).padStart(2)}% (${String(gradeB?.count || 0).padEnd(2)})`,
            `C ${asciiBar(gradeC?.pct || 0, 10)} ${String(gradeC?.pct || 0).padStart(2)}% (${String(gradeC?.count || 0).padEnd(2)})`,
            `D ${asciiBar(gradeD?.pct || 0, 10)} ${String(gradeD?.pct || 0).padStart(2)}% (${String(gradeD?.count || 0).padEnd(2)})`,
          ];

          return (
            <pre key={entity.id} className="exec-ascii-card">
              {buildCard(lines)}
            </pre>
          );
        })}
      </div>

      {/* SLA & PR Success */}
      <pre className="exec-ascii-block">
        {buildBlock([
          `SLA Achievement & PR Success Rate (%)`.padEnd(49, '─'),
          `Target: >=95%  │  [G] Pass  │  [Y] Near  │  [R] Miss`,
        ])}
      </pre>
      
      <div className="exec-ascii-cards">
        {entities.map((entity) => {
          const sla = entity.quality.slaRate;
          const pr = entity.quality.prSuccessRate;
          const label = getLabel(entity, dimensionType);
          const slaIcon = statusIcon(sla >= 95 ? 'green' : sla >= 90 ? 'yellow' : 'red');
          const prIcon = statusIcon(pr >= 95 ? 'green' : pr >= 90 ? 'yellow' : 'red');

          const lines = [
            label,
            DIVIDER,
            `SLA: ${slaIcon} ${String(sla).padEnd(3)}%`,
            `[${asciiBar(sla, 14)}]`,
            `PR:  ${prIcon} ${String(pr).padEnd(3)}%`,
            `[${asciiBar(pr, 14)}]`,
          ];

          return (
            <pre key={entity.id} className="exec-ascii-card">
              {buildCard(lines)}
            </pre>
          );
        })}
      </div>
    </div>
  );
};
