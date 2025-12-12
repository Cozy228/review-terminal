import type { EChartsOption } from 'echarts';
import { RetroEChart, resolveCssVar } from './RetroEChart';

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

const toneToColorVar: Record<Tone, string> = {
  green: 'var(--retro-primary)',
  blue: 'var(--retro-blue)',
  gold: 'var(--retro-gold)',
  red: 'var(--retro-red)',
  purple: 'var(--retro-purple)',
  pink: 'var(--retro-pink)',
  orange: 'var(--retro-legendary)',
  primary: 'var(--retro-primary)',
};

export const BarComparisonChart: React.FC<BarComparisonChartProps> = ({
  data,
  orientation = 'horizontal',
  height = 300,
}) => {
  const isHorizontal = orientation === 'horizontal';
  const borderColor = resolveCssVar('var(--retro-border)');
  const textSecondary = resolveCssVar('var(--text-secondary)');
  const textPrimary = resolveCssVar('var(--text-primary)');

  const categories = data.map((d) => d.label);
  const seriesData = data.map((d) => ({ value: d.value, tone: d.tone }));

  const tooltipFormatter = (params: any) => {
    const p = Array.isArray(params) ? params[0] : params;
    if (!p) return '';
    return `
      <div class="retro-chart-tooltip">
        <div class="retro-chart-tooltip-label">${p.name}</div>
        <div class="retro-chart-tooltip-item"><span>Percentage:</span><span>${p.value}%</span></div>
      </div>
    `;
  };

  const option: EChartsOption = {
    grid: {
      left: 20,
      right: 20,
      top: 10,
      bottom: 10,
      containLabel: true,
    },
    tooltip: {
      trigger: 'item',
      renderMode: 'html',
      confine: true,
      backgroundColor: 'transparent',
      borderWidth: 0,
      formatter: tooltipFormatter,
      extraCssText: 'box-shadow:none;',
    },
    xAxis: isHorizontal
      ? {
          type: 'value',
          min: 0,
          max: 100,
          axisLine: { lineStyle: { color: borderColor } },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: borderColor, type: 'dashed' } },
          axisLabel: {
            color: textSecondary,
            fontSize: 11,
          },
        }
      : {
          type: 'category',
          data: categories,
          axisLine: { lineStyle: { color: borderColor } },
          axisTick: { show: false },
          axisLabel: {
            color: textSecondary,
            fontSize: 11,
          },
        },
    yAxis: isHorizontal
      ? {
          type: 'category',
          data: categories,
          axisLine: { lineStyle: { color: borderColor } },
          axisTick: { show: false },
          axisLabel: {
            color: textPrimary,
            fontSize: 12,
            fontWeight: 'bold',
          },
        }
      : {
          type: 'value',
          min: 0,
          max: 100,
          axisLine: { lineStyle: { color: borderColor } },
          axisTick: { show: false },
          splitLine: { lineStyle: { color: borderColor, type: 'dashed' } },
          axisLabel: {
            color: textSecondary,
            fontSize: 11,
          },
        },
    series: [
      {
        type: 'bar' as const,
        data: seriesData,
        barCategoryGap: isHorizontal ? '25%' : '20%',
        barGap: 8,
        itemStyle: {
          color: (params: any) => {
            const tone = params.data?.tone as Tone;
            return resolveCssVar(toneToColorVar[tone] || toneToColorVar.green);
          },
        },
        label: {
          show: true,
          position: isHorizontal ? 'right' : 'top',
          formatter: '{c}%',
          color: textPrimary,
          fontSize: 12,
          fontWeight: 'bold',
        },
      },
    ],
  };

  return <RetroEChart option={option} height={height} />;
};
