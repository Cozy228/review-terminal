import type { TeamQualityData } from '../../types/executive';
import { RadialGaugeChart } from '../charts/RadialGaugeChart';

interface QualitySectionProps {
  data: TeamQualityData;
}

export const QualitySection: React.FC<QualitySectionProps> = ({ data }) => {
  return (
    <div className="grid-two">
      <div className="retro-card is-gold">
        <div className="retro-card-title">SLA ACHIEVEMENT</div>
        <RadialGaugeChart
          value={data.slaRate}
          target={data.slaTarget}
          label="SLA Rate"
          tone={data.slaRate >= data.slaTarget ? 'green' : 'gold'}
        />
      </div>

      <div className="retro-card is-purple">
        <div className="retro-card-title">PR SUCCESS RATE</div>
        <RadialGaugeChart
          value={data.prSuccessRate}
          target={data.prTarget}
          label="PR Success"
          tone={data.prSuccessRate >= data.prTarget ? 'green' : 'gold'}
        />
      </div>
    </div>
  );
};
