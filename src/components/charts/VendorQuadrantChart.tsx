import type { EChartsOption } from 'echarts';
import { RetroEChart } from './RetroEChart';
import { resolveCssVar } from './chartUtils';

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

export const VendorQuadrantChart: React.FC<VendorQuadrantChartProps> = ({ data, industryAvg }) => {
  const primaryColor = resolveCssVar('var(--retro-primary)');
  const goldColor = resolveCssVar('var(--retro-gold)');
  const pinkColor = resolveCssVar('var(--retro-pink)');
  const purpleColor = resolveCssVar('var(--retro-purple)');
  const avgColor = resolveCssVar('var(--retro-blue)');
  const borderColor = resolveCssVar('var(--retro-border)');
  const textSecondary = resolveCssVar('var(--text-secondary)');
  const textPrimary = resolveCssVar('var(--text-primary)');

  const contractorColors = [goldColor, pinkColor, purpleColor];

  const points = data.map((d, index) => ({
    name: d.name,
    value: [d.velocity, d.leadTime],
    isInternal: d.isInternal,
    itemStyle: {
      color: d.isInternal ? primaryColor : contractorColors[index % contractorColors.length],
    },
  }));

  type QuadrantPoint = { name: string; value: [number, number]; isInternal: boolean };

  const tooltipFormatter = (params: unknown) => {
    const p = Array.isArray(params) ? params[0] : params;
    if (!p || typeof p !== 'object') return '';

    const d = (p as { data?: unknown }).data;
    if (!d || typeof d !== 'object') return '';

    const point = d as Partial<QuadrantPoint>;
    const name = typeof point.name === 'string' ? point.name : '';
    const value = Array.isArray(point.value) ? point.value : [0, 0];
    const isInternal = point.isInternal === true;

    return `
      <div class="retro-chart-tooltip">
        <div class="retro-chart-tooltip-label">${name}</div>
        <div class="retro-chart-tooltip-item"><span>Velocity:</span><span>${value[0]} SP/mo</span></div>
        <div class="retro-chart-tooltip-item"><span>Lead Time:</span><span>${value[1]} days</span></div>
        <div class="retro-chart-tooltip-item"><span>Type:</span><span>${isInternal ? 'Internal' : 'Contractor'}</span></div>
      </div>
    `;
  };

  const normalizeExtent = (extent: unknown): { min: number; max: number } => {
    if (!extent || typeof extent !== 'object') return { min: 0, max: 0 };
    const record = extent as { min?: unknown; max?: unknown };
    return {
      min: typeof record.min === 'number' ? record.min : 0,
      max: typeof record.max === 'number' ? record.max : 0,
    };
  };

  const option: EChartsOption = {
    grid: { left: 58, right: 110, top: 16, bottom: 56, containLabel: true },
    tooltip: {
      trigger: 'item',
      renderMode: 'html',
      confine: true,
      backgroundColor: 'transparent',
      borderWidth: 0,
      formatter: tooltipFormatter,
      extraCssText: 'box-shadow:none;',
    },
    xAxis: {
      type: 'value',
      name: 'Velocity (SP/mo)',
      nameLocation: 'middle',
      nameGap: 22,
      nameTextStyle: {
        color: textSecondary,
        fontSize: 12,
      },
      axisLine: { lineStyle: { color: borderColor } },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: borderColor, type: 'dashed' } },
      axisLabel: {
        color: textSecondary,
        fontSize: 11,
      },
      min: (value: unknown) => normalizeExtent(value).min - 5,
      max: (value: unknown) => normalizeExtent(value).max + 5,
    },
    yAxis: {
      type: 'value',
      name: 'Lead Time (days)',
      nameLocation: 'middle',
      nameGap: 34,
      nameRotate: 90,
      inverse: true,
      nameTextStyle: {
        color: textSecondary,
        fontSize: 12,
      },
      axisLine: { lineStyle: { color: borderColor } },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: borderColor, type: 'dashed' } },
      axisLabel: {
        color: textSecondary,
        fontSize: 11,
      },
      min: (value: unknown) => normalizeExtent(value).min - 1,
      max: (value: unknown) => normalizeExtent(value).max + 1,
    },
    series: [
      {
        type: 'scatter' as const,
        name: 'Vendors',
        data: points,
        symbolSize: 10,
        label: {
          show: true,
          formatter: (p: unknown) => {
            const data = (p as { data?: unknown }).data;
            const name = (data as { name?: unknown } | undefined)?.name;
            return typeof name === 'string' ? name : '';
          },
          position: 'right',
          color: textPrimary,
          fontSize: 11,
          fontWeight: 'bold',
          offset: [8, 0],
        },
        labelLayout: { hideOverlap: true },
        markLine: {
          silent: true,
          symbol: ['none', 'none'],
          lineStyle: { color: avgColor, width: 1.5, type: 'dashed' },
          label: {
            formatter: 'Avg',
            color: avgColor,
            fontSize: 10,
          },
          data: [
            { xAxis: industryAvg.velocity },
            { yAxis: industryAvg.leadTime },
          ],
        },
      },
    ],
  };

  return <RetroEChart option={option} height={360} style={{ padding: 0 }} />;
};
