import { useMemo } from 'react';
import type { TeamDeliveryData } from '../../types/executive';
import { DeliveryAdapter } from '../../adapters/ExecutiveAdapter';
import { DataCardGroup } from '../retro/DataCardGroup';
import { TypewriterText } from '../retro/TypewriterText';
import { MonthlyTrendChart } from '../charts/MonthlyTrendChart';
import { VendorQuadrantChart } from '../charts/VendorQuadrantChart';

interface DeliverySectionProps {
  data: TeamDeliveryData;
}

export const DeliverySection: React.FC<DeliverySectionProps> = ({ data }) => {
  const primaryCards = useMemo(() => DeliveryAdapter.toPrimaryCards(data.primary), [data.primary]);
  const secondaryCards = useMemo(() => DeliveryAdapter.toSecondaryCards(data.secondary), [data.secondary]);
  const vendorNarrative = useMemo(() => DeliveryAdapter.toVendorNarrative(data.vendor), [data.vendor]);

  // Chart data transformations
  const monthlyTrendsData = useMemo(
    () => data.monthlyTrends ? DeliveryAdapter.toMonthlyTrendData(data.monthlyTrends) : [],
    [data.monthlyTrends]
  );

  const vendorQuadrantData = useMemo(
    () => data.vendorBenchmarks ? DeliveryAdapter.toVendorQuadrantData(data.vendorBenchmarks) : [],
    [data.vendorBenchmarks]
  );

  const trendNarrative = useMemo(
    () => data.monthlyTrends ? DeliveryAdapter.toTrendNarrative(data.monthlyTrends) : '',
    [data.monthlyTrends]
  );

  const industryAvgPoint = useMemo(
    () => data.vendorBenchmarks ? {
      velocity: data.vendorBenchmarks.industryAvg.velocity,
      leadTime: data.vendorBenchmarks.industryAvg.leadTime,
    } : { velocity: 0, leadTime: 0 },
    [data.vendorBenchmarks]
  );

  return (
    <>
      {/* Primary Metrics */}
      <div className="mb-4">
        <DataCardGroup items={primaryCards} className="delivery-primary-cards" columns={3} />
      </div>

      {/* Secondary Metrics */}
      <div className="mb-4">
        <DataCardGroup items={secondaryCards} className="delivery-secondary-cards" columns={3} />
      </div>

      {/* Monthly Trends Chart */}
      {monthlyTrendsData.length > 0 && (
        <div className="retro-card is-blue mb-4">
          <div className="retro-card-title">VELOCITY & LEAD TIME TRENDS (12 MONTHS)</div>
          <MonthlyTrendChart
            data={monthlyTrendsData}
            metrics={[
              { key: 'velocity', label: 'Velocity (SP)', color: 'var(--retro-primary)', yAxisId: 'left' },
              { key: 'leadTime', label: 'Lead Time (days)', color: 'var(--retro-gold)', yAxisId: 'right' },
            ]}
            height={280}
          />
          {trendNarrative && (
            <TypewriterText className="retro-card-note mt-2" initialText={trendNarrative} />
          )}
        </div>
      )}

      {/* Vendor Quadrant Chart */}
      {vendorQuadrantData.length > 0 && (
        <div className="retro-card is-gold">
          <div className="retro-card-title">VENDOR PERFORMANCE COMPARISON</div>
          <VendorQuadrantChart data={vendorQuadrantData} industryAvg={industryAvgPoint} />
          <TypewriterText className="retro-card-note mt-2" initialText={vendorNarrative} />
        </div>
      )}
    </>
  );
};
