const SPARK_CHARS = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
const GLITCH_CHARS = 'X#@!&%01';

export const generateProgressBar = (percent: number, width = 32): string => {
  const clamped = Math.max(0, Math.min(100, percent));
  const fill = Math.floor((clamped / 100) * width);
  const empty = width - fill;
  return '█'.repeat(fill) + '░'.repeat(empty);
};

export const generateSparkline = (data: number[]): string => {
  if (!data.length) return '';
  const max = Math.max(...data);
  if (max === 0) return ''.padEnd(data.length, ' ');
  return data
    .map((n) => {
      const index = Math.min(SPARK_CHARS.length - 1, Math.floor((n / max) * (SPARK_CHARS.length - 1)));
      return SPARK_CHARS[index];
    })
    .join('');
};

export const generateBlockChart = (values: number[], labels: string[], height = 8): string => {
  if (!values.length) return '';
  const max = Math.max(...values, 1);
  const lines: string[] = [];

  for (let row = height; row >= 1; row--) {
    const threshold = row / height;
    const line = values
      .map((value, index) => {
        if (value / max >= threshold) {
          // Color based on intensity (0-100 scale)
          const intensity = (value / max) * 100;
          let colorClass = '';
          if (intensity >= 75) colorClass = 'c4'; // Darkest
          else if (intensity >= 50) colorClass = 'c3';
          else if (intensity >= 25) colorClass = 'c2';
          else if (intensity > 0) colorClass = 'c1'; // Lightest
          return `<span class="chart-block ${colorClass}" data-month="${index}">█</span>`;
        }
        return '<span class="chart-block c0"> </span>';
      })
      .join(' ');
    lines.push(line);
  }

  const labelLine = labels.map((label, i) => `<span class="chart-label" data-month="${i}">${label.padEnd(3, ' ')}</span>`).join(' ');
  lines.push(labelLine);
  return lines.join('\n');
};

export const randomGlitch = (length: number): string => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
  }
  return result;
};
