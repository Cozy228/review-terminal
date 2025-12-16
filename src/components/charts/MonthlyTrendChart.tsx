import type { EChartsOption } from 'echarts';
import { RetroEChart } from './RetroEChart';
import { resolveCssVar } from './chartUtils';

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

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({
  data,
  metrics,
  height = 280,
}) => {
  const hasRightAxis = metrics.some((m) => m.yAxisId === 'right');

  const categories = data.map((d) => d.month);
  const borderColor = resolveCssVar('var(--retro-border)');
  const textSecondary = resolveCssVar('var(--text-secondary)');
  const textPrimary = resolveCssVar('var(--text-primary)');

  const series = metrics.map((m) => {
    const color = resolveCssVar(m.color);
    return {
      name: m.label,
      type: 'line' as const,
      smooth: true,
      showSymbol: false,
      yAxisIndex: m.yAxisId === 'right' ? 1 : 0,
      data: data.map((row) => Number(row[m.key] ?? 0)),
      lineStyle: { color, width: 2 },
      itemStyle: { color },
      areaStyle: { color, opacity: 0.18 },
      emphasis: { focus: 'series' as const },
    };
  });

  const tooltipFormatter = (params: unknown) => {
    if (!Array.isArray(params) || params.length === 0) return '';

    const first = params[0] as { axisValueLabel?: unknown; name?: unknown };
    const label =
      (typeof first.axisValueLabel === 'string' && first.axisValueLabel) ||
      (typeof first.name === 'string' ? first.name : '');

    const items = params
      .map((raw) => {
        const p = raw as { seriesName?: unknown; color?: unknown; value?: unknown };
        const seriesName = typeof p.seriesName === 'string' ? p.seriesName : '';
        const color = typeof p.color === 'string' ? p.color : '';
        const value = Array.isArray(p.value) ? p.value[1] : p.value;
        return `<div class="retro-chart-tooltip-item"><span>${seriesName}:</span><span style="color:${color}">${value}</span></div>`;
      })
      .join('');
    return `<div class="retro-chart-tooltip"><div class="retro-chart-tooltip-label">${label}</div>${items}</div>`;
  };

  const option: EChartsOption = {
    grid: {
      left: 10,
      right: hasRightAxis ? 40 : 10,
      top: 10,
      bottom: 10,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      renderMode: 'html',
      confine: true,
      backgroundColor: 'transparent',
      borderWidth: 0,
      formatter: tooltipFormatter,
      extraCssText: 'box-shadow:none;',
      axisPointer: { type: 'line' },
    },
    legend: {
      data: metrics.map((m) => m.label),
      textStyle: {
        color: textPrimary,
        fontSize: 11,
      },
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: borderColor } },
      axisTick: { show: false },
      axisLabel: {
        color: textSecondary,
        fontSize: 10,
      },
    },
    yAxis: hasRightAxis
      ? [
          {
            type: 'value',
            axisLine: { lineStyle: { color: borderColor } },
            axisTick: { show: false },
            splitLine: { lineStyle: { color: borderColor, type: 'dashed' } },
            axisLabel: {
              color: textSecondary,
              fontSize: 10,
            },
          },
          {
            type: 'value',
            axisLine: { lineStyle: { color: borderColor } },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: {
              color: textSecondary,
              fontSize: 10,
            },
          },
        ]
      : [
          {
            type: 'value',
            axisLine: { lineStyle: { color: borderColor } },
            axisTick: { show: false },
            splitLine: { lineStyle: { color: borderColor, type: 'dashed' } },
            axisLabel: {
              color: textSecondary,
              fontSize: 10,
            },
          },
        ],
    series,
  };

  return <RetroEChart option={option} height={height} />;
};
