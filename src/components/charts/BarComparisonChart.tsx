import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

type Tone = 'green' | 'blue' | 'gold' | 'red' | 'purple' | 'pink' | 'orange' | 'primary';

interface BarComparisonChartProps {
  data: Array<{
    label: string;
    value: number;
    tone: Tone;
  }>;
  orientation?: 'horizontal' | 'vertical';
  height?: number;
}

const TONE_COLORS: Record<Tone, string> = {
  green: 'var(--retro-primary)',
  blue: 'var(--retro-blue)',
  gold: 'var(--retro-gold)',
  red: 'var(--retro-red)',
  purple: 'var(--retro-purple)',
  pink: 'var(--retro-pink)',
  orange: '#ff8c00',
  primary: 'var(--retro-primary)',
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="retro-chart-tooltip">
        <div className="retro-chart-tooltip-label">{data.label}</div>
        <div className="retro-chart-tooltip-item">
          <span>Percentage:</span>
          <span>{data.value}%</span>
        </div>
      </div>
    );
  }
  return null;
};

export const BarComparisonChart: React.FC<BarComparisonChartProps> = ({
  data,
  orientation = 'horizontal',
  height = 300,
}) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div className="retro-chart-container">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={isHorizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 10, right: 40, left: isHorizontal ? 20 : 10, bottom: 10 }}
          barGap={8}
          barCategoryGap={isHorizontal ? '25%' : '20%'}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--retro-border)" />
          {isHorizontal ? (
            <>
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: 'var(--text-secondary)', fontFamily: 'Courier New, monospace', fontSize: 11 }}
                tickLine={{ stroke: 'var(--retro-border)' }}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fill: 'var(--text-primary)', fontFamily: 'Courier New, monospace', fontSize: 12, fontWeight: 'bold' }}
                tickLine={{ stroke: 'var(--retro-border)' }}
                width={30}
              />
            </>
          ) : (
            <>
              <XAxis
                type="category"
                dataKey="label"
                tick={{ fill: 'var(--text-secondary)', fontFamily: 'Courier New, monospace', fontSize: 11 }}
                tickLine={{ stroke: 'var(--retro-border)' }}
              />
              <YAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: 'var(--text-secondary)', fontFamily: 'Courier New, monospace', fontSize: 11 }}
                tickLine={{ stroke: 'var(--retro-border)' }}
              />
            </>
          )}
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 255, 65, 0.05)' }} />
          <Bar
            dataKey="value"
            radius={[0, 4, 4, 0]}
            animationDuration={1200}
            animationBegin={0}
            isAnimationActive={true}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={TONE_COLORS[entry.tone]} />
            ))}
            <LabelList
              dataKey="value"
              position={isHorizontal ? 'right' : 'top'}
              formatter={(value: any) => `${value}%`}
              style={{ fill: 'var(--text-primary)', fontFamily: 'Courier New, monospace', fontSize: '12px', fontWeight: 'bold' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
