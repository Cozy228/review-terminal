import { ASCII_BASICS } from '../../constants/ascii-executive';
import type { DimensionEntity } from '../../types/executive';

interface BasicsSectionProps {
  entities: DimensionEntity[];
  dimensionType: 'department' | 'vendor' | 'geo';
}

// Generate ASCII progress bar
const asciiBar = (pct: number, width: number = 12): string => {
  const filled = Math.round((pct / 100) * width);
  return '█'.repeat(Math.max(1, filled)) + '░'.repeat(Math.max(0, width - filled));
};

const BLOCK_WIDTH = 78;
const BLOCK_TOP = `┌${'─'.repeat(BLOCK_WIDTH)}┐`;
const BLOCK_BOTTOM = `└${'─'.repeat(BLOCK_WIDTH)}┘`;
const asciiBlockLine = (content: string = '') => `│${content.padEnd(BLOCK_WIDTH)}│`;
const buildBlock = (lines: string[]) => [BLOCK_TOP, ...lines.map(asciiBlockLine), BLOCK_BOTTOM].join('\n');

const CARD_WIDTH = 28;
const H_LINE = '─'.repeat(CARD_WIDTH);
const CARD_TOP = `┌${H_LINE}┐`;
const CARD_DIVIDER = `├${H_LINE}┤`;
const CARD_BOTTOM = `└${H_LINE}┘`;
const DIVIDER_TOKEN = '__DIVIDER__';

const padLine = (text: string = '') => {
  const normalized = text.length > 26 ? text.slice(0, 26) : text;
  return `│ ${normalized.padEnd(26)} │`;
};

const buildCard = (lines: string[]) => (
  [
    CARD_TOP,
    ...lines.map((line) => (line === DIVIDER_TOKEN ? CARD_DIVIDER : padLine(line))),
    CARD_BOTTOM,
  ].join('\n')
);

export const BasicsSection = ({ entities, dimensionType }: BasicsSectionProps) => {
  // Calculate totals
  const totalHead = entities.reduce((sum, e) => sum + e.headcount, 0);
  const totalEmployee = entities.reduce((sum, e) => sum + Math.round(e.headcount * e.employeePct / 100), 0);
  const totalContractor = totalHead - totalEmployee;
  const employeePct = Math.round((totalEmployee / totalHead) * 100);
  
  // Aggregate job titles (only for department dimension)
  const totalRoles = entities.reduce((acc, e) => ({
    vp: acc.vp + (e.basics.roles.vp || 0),
    avp: acc.avp + (e.basics.roles.avp || 0),
    officer: acc.officer + (e.basics.roles.officer || 0),
    sa: acc.sa + (e.basics.roles.sa || 0),
  }), { vp: 0, avp: 0, officer: 0, sa: 0 });

  // Get entity label
  const getLabel = (e: DimensionEntity) => {
    if (dimensionType === 'vendor') return e.company || e.name;
    if (dimensionType === 'geo') return e.location || e.name;
    return e.name;
  };

  return (
    <div className="exec-section">
      {/* ASCII Section Header */}
      <pre className="exec-ascii-title" style={{ color: 'var(--accent-info)' }}>
{ASCII_BASICS}
      </pre>
      
      {/* Summary Box */}
      <pre className="exec-ascii-block">
        {buildBlock([
          `  TOTAL: ${String(totalHead).padEnd(4)} │  EMPLOYEE: ${String(employeePct).padStart(2)}% (${String(totalEmployee).padEnd(3)}) │  CONTRACTOR: ${String(100 - employeePct).padStart(2)}% (${String(totalContractor).padEnd(3)})`,
          `  [${asciiBar(employeePct, 40)}] ${String(employeePct).padStart(3)}% Employee`,
        ])}
      </pre>

      {/* Job Title - only for department */}
      {dimensionType === 'department' && (
        <pre className="exec-ascii-block">
          {buildBlock([
            `  JOB TITLE DISTRIBUTION`.padEnd(30),
            `  VP/AVP: ${String(totalRoles.vp + totalRoles.avp).padEnd(3)} │ Officer: ${String(totalRoles.officer).padEnd(3)} │ SA: ${String(totalRoles.sa).padEnd(3)}`,
          ])}
        </pre>
      )}

      {/* Entity Cards - ASCII Style */}
      <div className="exec-ascii-cards">
        {entities.map((entity) => {
          const empCount = Math.round(entity.headcount * entity.employeePct / 100);
          const conCount = entity.headcount - empCount;
          const label = getLabel(entity);
          const roles = entity.basics.roles;

          const baseLines: string[] = [
            label,
            `(${entity.headcount} ppl)`,
            DIVIDER_TOKEN,
            `Total: ${String(entity.headcount).padStart(4)} ppl`,
            `Employee: ${String(entity.employeePct).padStart(3)}% (${empCount})`,
            `Contract: ${String(entity.contractorPct).padStart(3)}% (${conCount})`,
            DIVIDER_TOKEN,
            `[${asciiBar(entity.employeePct, 14)}] ${String(entity.employeePct).padStart(3)}%`,
          ];

          if (dimensionType === 'department') {
            const vpCount = (roles.vp || 0) + (roles.avp || 0);
            const officerCount = roles.officer || 0;
            const saCount = roles.sa || 0;
            baseLines.push(
              DIVIDER_TOKEN,
              `VP/AVP ${asciiBar((vpCount / entity.headcount) * 100, 8)} ${String(vpCount).padStart(3)}`,
              `Officer ${asciiBar((officerCount / entity.headcount) * 100, 8)} ${String(officerCount).padStart(3)}`,
              `SA      ${asciiBar((saCount / entity.headcount) * 100, 8)} ${String(saCount).padStart(3)}`,
            );
          }

          return (
            <pre key={entity.id} className="exec-ascii-card">
              {buildCard(baseLines)}
            </pre>
          );
        })}
      </div>
    </div>
  );
};
