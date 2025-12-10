import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthlyTrendChartProps {
  data: Array<{ month: string; [key: string]: string | number }>;
  metrics: Array<{
    key: string;
    label: string;
    color: string;
    yAxisId?: 'left' | 'right';
  }>;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="retro-chart-tooltip">
        <div className="retro-chart-tooltip-label">{label}</div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="retro-chart-tooltip-item">
            <span>{entry.name}:</span>
            <span style={{ color: entry.color }}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({
  data,
  metrics,
  height = 280,
}) => {
  const hasRightAxis = metrics.some(m => m.yAxisId === 'right');

  return (
    <div className="retro-chart-container">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: hasRightAxis ? 30 : 10, left: 10, bottom: 0 }}>
          <defs>
            {metrics.map((metric) => (
              <linearGradient key={metric.key} id={`gradient-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={metric.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={metric.color} stopOpacity={0.05} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--retro-border)" />
          <XAxis
            dataKey="month"
            tick={{ fill: 'var(--text-secondary)', fontFamily: 'Courier New, monospace', fontSize: 10 }}
          />
          <YAxis
            yAxisId="left"
            tick={{ fill: 'var(--text-secondary)', fontFamily: 'Courier New, monospace', fontSize: 10 }}
          />
          {hasRightAxis && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: 'var(--text-secondary)', fontFamily: 'Courier New, monospace', fontSize: 10 }}
            />
          )}
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontFamily: 'Courier New, monospace', fontSize: '11px' }}
            iconType="line"
          />
          {metrics.map((metric) => (
            <Area
              key={metric.key}
              type="monotone"
              dataKey={metric.key}
              name={metric.label}
              stroke={metric.color}
              strokeWidth={2}
              fill={`url(#gradient-${metric.key})`}
              yAxisId={metric.yAxisId || 'left'}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
