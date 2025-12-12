import type { EChartsOption } from 'echarts';
import { RetroEChart, resolveCssVar } from './RetroEChart';

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

  const tooltipFormatter = (params: any) => {
    const p = Array.isArray(params) ? params[0] : params;
    const d = p?.data;
    if (!d) return '';
    return `
      <div class="retro-chart-tooltip">
        <div class="retro-chart-tooltip-label">${d.name}</div>
        <div class="retro-chart-tooltip-item"><span>Velocity:</span><span>${d.value[0]} SP/mo</span></div>
        <div class="retro-chart-tooltip-item"><span>Lead Time:</span><span>${d.value[1]} days</span></div>
        <div class="retro-chart-tooltip-item"><span>Type:</span><span>${d.isInternal ? 'Internal' : 'Contractor'}</span></div>
      </div>
    `;
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
      min: (value: any) => value.min - 5,
      max: (value: any) => value.max + 5,
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
      min: (value: any) => value.min - 1,
      max: (value: any) => value.max + 1,
    },
    series: [
      {
        type: 'scatter' as const,
        name: 'Vendors',
        data: points,
        symbolSize: 10,
        label: {
          show: true,
          formatter: (p: any) => p.data?.name ?? '',
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
