import { ASCII_DELIVERY } from '../../constants/ascii-executive';
import type { DimensionEntity } from '../../types/executive';

interface DeliverySectionProps {
  entities: DimensionEntity[];
  dimensionType: 'department' | 'vendor' | 'geo';
}

// Card dimensions for consistent vertical borders
const CARD_WIDTH = 28;
const CARD_INNER = CARD_WIDTH - 2; // account for leading/trailing space inside the border
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

// Block builder (for section headers) - consistent width
const BLOCK_WIDTH = 78;
const BLOCK_INNER = BLOCK_WIDTH - 2;
const BLOCK_TOP = `┌${'─'.repeat(BLOCK_WIDTH)}┐`;
const BLOCK_BOTTOM = `└${'─'.repeat(BLOCK_WIDTH)}┘`;
const padBlock = (text: string = '') => `│ ${text.slice(0, BLOCK_INNER).padEnd(BLOCK_INNER)} │`;
const buildBlock = (lines: string[]) => [BLOCK_TOP, ...lines.map(padBlock), BLOCK_BOTTOM].join('\n');

// Status indicator
const statusIcon = (status: string): string => {
  switch (status) {
    case 'green': return '[G]';
    case 'red': return '[R]';
    default: return '[Y]';
  }
};

// Get entity label
const getLabel = (e: DimensionEntity, dim: string) => {
  if (dim === 'vendor') return e.company || e.name;
  if (dim === 'geo') return e.location || e.name;
  return e.name;
};

// ASCII bar
const asciiBar = (value: number, max: number, width: number = 12): string => {
  const filled = Math.round((value / max) * width);
  return '█'.repeat(Math.max(0, filled)) + '░'.repeat(Math.max(0, width - filled));
};

export const DeliverySection = ({ entities, dimensionType }: DeliverySectionProps) => {
  const firstEntity = entities[0];
  const velocityMetric = firstEntity?.delivery.metrics.find(m => m.id === 'velocity');
  const leadTimeMetric = firstEntity?.delivery.metrics.find(m => m.id === 'leadTime');
  const orgAvgVelocity = velocityMetric?.orgAvg || 52;
  const orgAvgLeadTime = leadTimeMetric?.orgAvg || 8.5;

  const hasLeadTime = entities.some(e => e.delivery.metrics.some(m => m.id === 'leadTime'));

  return (
    <div className="exec-section">
      {/* ASCII Section Header */}
      <pre className="exec-ascii-title" style={{ color: 'var(--accent-success)' }}>
{ASCII_DELIVERY}
      </pre>

      {/* Lead Time Section */}
      {hasLeadTime && (
        <>
          <pre className="exec-ascii-block">
            {buildBlock([
              `Lead Time Benchmark (days)`.padEnd(40, '─'),
              `Org Avg: ${orgAvgLeadTime}d  │  Median: 7.8d  │  Target: <=7d`,
              `[G] Green: <=7d  │  [Y] Yellow: 7~8.5d  │  [R] Red: >8.5d`,
            ])}
          </pre>

          <div className="exec-ascii-cards">
            {entities.map((entity) => {
              const lt = entity.delivery.metrics.find(m => m.id === 'leadTime');
              if (!lt) return null;
              const label = getLabel(entity, dimensionType);
              const status = statusIcon(lt.status || 'yellow');

              const lines = [
                label,
                `${status} ${String(lt.avg).padEnd(4)}d avg`,
                DIVIDER,
                `Min: ${String(lt.min).padEnd(5)}d`,
                `Max: ${String(lt.max).padEnd(5)}d`,
                `Med: ${String(lt.median).padEnd(5)}d`,
                DIVIDER,
                `[${asciiBar(lt.avg, 15, 14)}]`,
                `vs Org: ${lt.avg <= orgAvgLeadTime ? 'OK' : 'HIGH'}`,
              ];

              return (
                <pre key={entity.id} className="exec-ascii-card">
                  {buildCard(lines)}
                </pre>
              );
            })}
          </div>
        </>
      )}

      {/* Velocity Section */}
      <pre className="exec-ascii-block">
        {buildBlock([
          `Velocity Benchmark (SP/person/month)`.padEnd(46, '─'),
          `Org Avg: ${orgAvgVelocity} SP  │  [G] >=+25%  │  [Y] ±15%  │  [R] <-25%`,
        ])}
      </pre>

      <div className="exec-ascii-cards">
        {entities.map((entity) => {
          const v = entity.delivery.metrics.find(m => m.id === 'velocity');
          if (!v) return null;
          const label = getLabel(entity, dimensionType);
          const vsOrgPct = Math.round(((v.avg - orgAvgVelocity) / orgAvgVelocity) * 100);
          const vsOrgStr = vsOrgPct >= 0 ? `+${vsOrgPct}%` : `${vsOrgPct}%`;
          const status = statusIcon(v.status || 'yellow');

          const lines = [
            label,
            `${status} ${String(v.avg).padEnd(4)} SP`,
            DIVIDER,
            `[${asciiBar(v.avg, 80, 14)}]`,
            `^ Max: ${String(v.max).padEnd(5)} SP`,
            `x Med: ${String(v.median).padEnd(5)} SP`,
            `L Min: ${String(v.min).padEnd(5)} SP`,
            DIVIDER,
            `vs Org: ${vsOrgStr}`,
            `Status: ${(v.status === 'green' ? 'Exceeding' : v.status === 'red' ? 'Below' : 'Meeting')}`,
          ];

          return (
            <pre key={entity.id} className="exec-ascii-card">
              {buildCard(lines)}
            </pre>
          );
        })}
      </div>

      {/* Legend */}
      <pre className="exec-ascii-block" style={{ color: 'var(--text-secondary)' }}>
{`Legend: ██ = Avg │ ^ = Max │ L = Min │ x = Median`}
      </pre>
    </div>
  );
};
