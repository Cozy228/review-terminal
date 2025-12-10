import { useState, useEffect, useRef } from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import gsap from 'gsap';

type Tone = 'green' | 'gold' | 'red';

interface RadialGaugeProps {
  value: number; // 0-100
  target?: number;
  label: string;
  tone: Tone;
}

const TONE_COLORS: Record<Tone, string> = {
  green: 'var(--retro-primary)',
  gold: 'var(--retro-gold)',
  red: 'var(--retro-red)',
};

export const RadialGaugeChart: React.FC<RadialGaugeProps> = ({
  value,
  label,
  tone,
}) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [displayValue, setDisplayValue] = useState(0);
  const animationRef = useRef({ value: 0 });

  useEffect(() => {
    // Delay animation start to ensure component is visible
    const timer = setTimeout(() => {
      setAnimatedValue(value);

      // Animate the display number
      gsap.to(animationRef.current, {
        value: value,
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: () => {
          setDisplayValue(Math.round(animationRef.current.value));
        },
      });
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const data = [
    {
      name: label,
      value: animatedValue,
      fill: TONE_COLORS[tone],
    },
  ];

  return (
    <div className="retro-chart-container" style={{ position: 'relative', height: '280px' }}>
      <ResponsiveContainer width="100%" height={280}>
        <RadialBarChart
          cx="50%"
          cy="85%"
          innerRadius="65%"
          outerRadius="100%"
          barSize={32}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: 'var(--retro-border)', opacity: 0.5 }}
            dataKey="value"
            cornerRadius={8}
            animationDuration={1500}
            animationBegin={0}
            isAnimationActive={true}
          />
        </RadialBarChart>
      </ResponsiveContainer>
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
            color: TONE_COLORS[tone],
          }}
        >
          {displayValue}%
        </div>
      </div>
    </div>
  );
};
