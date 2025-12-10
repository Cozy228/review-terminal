import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Cell, LabelList } from 'recharts';

export interface VendorQuadrantData {
  name: string;
  velocity: number;
  leadTime: number;
  isInternal: boolean;
}

interface VendorQuadrantChartProps {
  data: VendorQuadrantData[];
  industryAvg: { velocity: number; leadTime: number };
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="retro-chart-tooltip">
        <div className="retro-chart-tooltip-label">{data.name}</div>
        <div className="retro-chart-tooltip-item">
          <span>Velocity:</span>
          <span>{data.velocity} SP/mo</span>
        </div>
        <div className="retro-chart-tooltip-item">
          <span>Lead Time:</span>
          <span>{data.leadTime} days</span>
        </div>
        <div className="retro-chart-tooltip-item">
          <span>Type:</span>
          <span>{data.isInternal ? 'Internal' : 'Contractor'}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const VendorQuadrantChart: React.FC<VendorQuadrantChartProps> = ({ data, industryAvg }) => {
  const getColor = (isInternal: boolean, index: number) => {
    if (isInternal) return 'var(--retro-primary)';
    const contractorColors = ['var(--retro-gold)', 'var(--retro-pink)', 'var(--retro-purple)'];
    return contractorColors[index % contractorColors.length];
  };

  return (
    <div className="retro-chart-container">
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--retro-border)" />
          <XAxis
            type="number"
            dataKey="velocity"
            name="Velocity"
            unit=" SP"
            domain={['dataMin - 5', 'dataMax + 5']}
            tick={{ fill: 'var(--text-secondary)', fontFamily: 'Courier New, monospace', fontSize: 11 }}
            label={{ value: 'Velocity (SP/month)', position: 'bottom', fill: 'var(--text-secondary)', fontFamily: 'Courier New, monospace', fontSize: 12 }}
          />
          <YAxis
            type="number"
            dataKey="leadTime"
            name="Lead Time"
            unit=" days"
            domain={['dataMin - 1', 'dataMax + 1']}
            reversed
            tick={{ fill: 'var(--text-secondary)', fontFamily: 'Courier New, monospace', fontSize: 11 }}
            label={{ value: 'Lead Time (days)', angle: -90, position: 'left', fill: 'var(--text-secondary)', fontFamily: 'Courier New, monospace', fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

          {/* Reference lines for quadrants */}
          <ReferenceLine
            x={industryAvg.velocity}
            stroke="var(--retro-blue)"
            strokeDasharray="5 5"
            strokeWidth={1.5}
            label={{ value: 'Avg', position: 'top', fill: 'var(--retro-blue)', fontFamily: 'Courier New, monospace', fontSize: 10 }}
          />
          <ReferenceLine
            y={industryAvg.leadTime}
            stroke="var(--retro-blue)"
            strokeDasharray="5 5"
            strokeWidth={1.5}
            label={{ value: 'Avg', position: 'right', fill: 'var(--retro-blue)', fontFamily: 'Courier New, monospace', fontSize: 10 }}
          />

          <Scatter name="Vendors" data={data} fill="var(--retro-primary)">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.isInternal, index)} />
            ))}
            <LabelList
              dataKey="name"
              position="right"
              style={{
                fill: 'var(--text-primary)',
                fontFamily: 'Courier New, monospace',
                fontSize: '11px',
                fontWeight: 'bold',
              }}
              offset={8}
            />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};
