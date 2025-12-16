import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import type { EChartsOption } from 'echarts';
import { RetroEChart } from './RetroEChart';
import { resolveCssVar } from './chartUtils';

type Tone = 'green' | 'gold' | 'red';

interface RadialGaugeProps {
  value: number;
  target?: number;
  label: string;
  tone: Tone;
}

const toneToColorVar: Record<Tone, string> = {
  green: 'var(--retro-primary)',
  gold: 'var(--retro-gold)',
  red: 'var(--retro-red)',
};

export const RadialGaugeChart: React.FC<RadialGaugeProps> = ({ value, label, tone }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef({ value: 0 });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      gsap.to(animationRef.current, {
        value,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: () => {
          setDisplayValue(Math.round(animationRef.current.value));
        },
      });
    }, 100);
    return () => window.clearTimeout(timer);
  }, [value]);

  const toneColor = resolveCssVar(toneToColorVar[tone]);
  const borderColor = resolveCssVar('var(--retro-border)');

  const option: EChartsOption = {
    series: [
      {
        type: 'gauge' as const,
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        radius: '100%',
        center: ['50%', '85%'],
        pointer: { show: false },
        axisLine: {
          roundCap: true,
          lineStyle: {
            width: 18,
            color: [[1, borderColor]],
          },
        },
        progress: {
          show: true,
          roundCap: true,
          width: 18,
          itemStyle: { color: toneColor },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: { show: false },
        title: { show: false },
        data: [{ value, name: label }],
      },
    ],
  };

  return (
    <div style={{ position: 'relative', height: '280px' }}>
      <RetroEChart option={option} height={280} className="retro-chart-container" style={{ height: '280px' }} />
      <div
        style={{
          position: 'absolute',
          top: '70%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        <div
          className="radial-gauge-label"
          style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: toneColor,
          }}
        >
          {displayValue}%
        </div>
      </div>
    </div>
  );
};
