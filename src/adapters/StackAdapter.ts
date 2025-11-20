import type { TechStackData } from '../types';

export class StackAdapter {
  static toHorizontalBars(data: TechStackData): string {
    const lines: string[] = [];
    const maxBarLength = 50;
    
    lines.push('Language Distribution');
    lines.push('');
    
    data.languages.forEach(lang => {
      const barLength = Math.round((lang.percentage / 100) * maxBarLength);
      const bar = '█'.repeat(barLength) + '░'.repeat(maxBarLength - barLength);
      const line = `  ${lang.name.padEnd(12)} ${bar} ${lang.percentage}%`;
      lines.push(line);
    });
    
    return lines.join('\n');
  }

  static toFrameworkBars(data: TechStackData): string {
    const lines: string[] = [];
    const maxHours = Math.max(...data.frameworks.map(f => f.hours));
    const maxBarLength = 40;
    
    lines.push('');
    lines.push('Most Active Frameworks');
    lines.push('');
    
    data.frameworks.forEach(framework => {
      const barLength = Math.round((framework.hours / maxHours) * maxBarLength);
      const bar = '█'.repeat(barLength) + '░'.repeat(maxBarLength - barLength);
      const line = `  ${framework.name.padEnd(10)} ${bar} ${framework.hours.toLocaleString()}h`;
      lines.push(line);
    });
    
    return lines.join('\n');
  }
}
