import type { WorkflowData } from '../types';

export class FlowAdapter {
  static toBlockMap(data: WorkflowData): string {
    const lines: string[] = [];
    const blockWidth = 50;
    
    lines.push('  Task Completion Heat Map');
    
    // Create visual representation with different characters
    let row1 = '  ';
    let row2 = '  ';
    let row3 = '  ';
    
    // Distribute blocks across three rows for visual effect
    for (let i = 0; i < blockWidth; i++) {
      const position = i / blockWidth;
      
      if (position < 0.3) {
        row1 += i % 3 === 0 ? '█' : i % 3 === 1 ? '▓' : '▓';
      } else if (position < 0.5) {
        row1 += i % 2 === 0 ? '▓' : '░';
      } else {
        row1 += '░';
      }
      
      if (position < 0.2) {
        row2 += '░';
      } else if (position < 0.5) {
        row2 += i % 3 === 0 ? '█' : '▓';
      } else if (position < 0.7) {
        row2 += '░';
      } else {
        row2 += i % 2 === 0 ? '▓' : '█';
      }
      
      if (position < 0.15) {
        row3 += i % 2 === 0 ? '▓' : '█';
      } else if (position < 0.4) {
        row3 += '░';
      } else if (position < 0.7) {
        row3 += i % 3 === 0 ? '█' : i % 3 === 1 ? '▓' : '░';
      } else {
        row3 += '░';
      }
    }
    
    lines.push(row1);
    lines.push(row2);
    lines.push(row3);
    
    return lines.join('\n');
  }

  static formatStats(data: WorkflowData): string[] {
    const { tickets, totalTickets } = data;
    
    return [
      '',
      '  Statistics',
      `  ✅ Completed:     ${tickets.done} (${((tickets.done / totalTickets) * 100).toFixed(1)}%)`,
      `  🔄 In Progress:   ${tickets.inProgress}  (${((tickets.inProgress / totalTickets) * 100).toFixed(1)}%)`,
      `  🔴 Blocked:       ${tickets.blocked}  (${((tickets.blocked / totalTickets) * 100).toFixed(1)}%)`,
    ];
  }
}
