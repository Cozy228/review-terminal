import React from 'react';
import ReactEChartsCoreImport from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { LineChart, ScatterChart, GaugeChart, BarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';

echarts.use([
  LineChart,
  ScatterChart,
  GaugeChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  MarkLineComponent,
  CanvasRenderer,
]);

const ReactEChartsCore =
  (ReactEChartsCoreImport as unknown as { default?: React.ComponentType<any> }).default ??
  (ReactEChartsCoreImport as unknown as React.ComponentType<any>);

export function resolveCssVar(color: string): string {
  if (typeof window === 'undefined') return color;
  const match = color.match(/^var\((--[^)]+)\)$/);
  if (!match) return color;
  const value = getComputedStyle(document.documentElement).getPropertyValue(match[1]).trim();
  return value || color;
}

interface RetroEChartProps {
  option: EChartsOption;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const RetroEChart: React.FC<RetroEChartProps> = ({
  option,
  height = 280,
  className = 'retro-chart-container',
  style,
}) => {
  return (
    <div className={className} style={style}>
      <ReactEChartsCore
        echarts={echarts}
        option={{ animation: false, useDirtyRect: true, ...option }}
        notMerge
        lazyUpdate
        style={{ width: '100%', height }}
      />
    </div>
  );
};
