import type { TechStackData } from '../types';

export class StackAdapter {
  static toHorizontalBars(data: TechStackData): string {
    const lines: string[] = [];
    const maxBarLength = 30;
    
    lines.push('  Language Distribution');
    
    data.languages.forEach(lang => {
      const barLength = Math.round((lang.percentage / 100) * maxBarLength);
      const bar = '█'.repeat(barLength);
      const line = `  ${lang.name.padEnd(12)} ${bar.padEnd(maxBarLength)}  ${lang.percentage}%`;
      lines.push(line);
    });
    
    return lines.join('\n');
  }

  static toFrameworkBars(data: TechStackData): string {
    const lines: string[] = [];
    const maxHours = Math.max(...data.frameworks.map(f => f.hours));
    const maxBarLength = 20;
    
    lines.push('');
    lines.push('  Most Active Frameworks');
    
    data.frameworks.forEach(framework => {
      const barLength = Math.round((framework.hours / maxHours) * maxBarLength);
      const bar = '█'.repeat(barLength);
      const line = `  • ${framework.name.padEnd(10)} ${bar.padEnd(maxBarLength)}  ${framework.hours.toLocaleString()} hours`;
      lines.push(line);
    });
    
    return lines.join('\n');
  }
}
