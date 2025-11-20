import type { WorkflowData } from '../types';

export class FlowAdapter {
  static toBlockMap(data: WorkflowData): string {
    const { tickets } = data;
    const lines: string[] = [];
    
    lines.push('Task Completion Overview');
    lines.push('');
    
    // Create simple vertical bar chart
    const maxValue = Math.max(tickets.done, tickets.inProgress, tickets.blocked);
    const height = 10;
    const barWidth = 8;
    
    // Add value labels on top
    const valueLine = `    ${tickets.done.toString().padEnd(barWidth)}    ${tickets.inProgress.toString().padEnd(barWidth)}    ${tickets.blocked.toString().padEnd(barWidth)}`;
    lines.push(valueLine);
    
    // Build chart from top to bottom
    for (let row = height; row >= 0; row--) {
      const threshold = (row / height) * maxValue;
      let line = '  ';
      
      // Done bar
      if (tickets.done >= threshold) {
        line += '█'.repeat(barWidth);
      } else {
        line += ' '.repeat(barWidth);
      }
      line += '  ';
      
      // In Progress bar
      if (tickets.inProgress >= threshold) {
        line += '█'.repeat(barWidth);
      } else {
        line += ' '.repeat(barWidth);
      }
      line += '  ';
      
      // Blocked bar
      if (tickets.blocked >= threshold) {
        line += '█'.repeat(barWidth);
      } else {
        line += ' '.repeat(barWidth);
      }
      
      lines.push(line);
    }
    
    // Add X-axis labels
    const labelLine = `  ${' Done '.padEnd(barWidth)}  ${'Progress'.padEnd(barWidth)}  ${'Blocked'.padEnd(barWidth)}`;
    lines.push('');
    lines.push(labelLine);
    
    return lines.join('\n');
  }

  static formatStats(data: WorkflowData): string[] {
    const { tickets, totalTickets } = data;
    
    return [
      '',
      'Statistics',
      `Completed:     ${tickets.done} (${((tickets.done / totalTickets) * 100).toFixed(1)}%)`,
      `In Progress:   ${tickets.inProgress}  (${((tickets.inProgress / totalTickets) * 100).toFixed(1)}%)`,
      `Blocked:       ${tickets.blocked}  (${((tickets.blocked / totalTickets) * 100).toFixed(1)}%)`,
    ];
  }

  static formatStatsWithIcons(data: WorkflowData) {
    const { tickets, totalTickets } = data;
    
    return [
      {
        icon: 'CheckCircle2',
        color: 'var(--accent-success)',
        text: `Completed: ${tickets.done} (${((tickets.done / totalTickets) * 100).toFixed(1)}%)`
      },
      {
        icon: 'Loader2',
        color: 'var(--accent-info)',
        text: `In Progress: ${tickets.inProgress} (${((tickets.inProgress / totalTickets) * 100).toFixed(1)}%)`
      },
      {
        icon: 'XCircle',
        color: 'var(--accent-error)',
        text: `Blocked: ${tickets.blocked} (${((tickets.blocked / totalTickets) * 100).toFixed(1)}%)`
      }
    ];
  }
}
