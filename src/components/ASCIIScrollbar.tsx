interface ASCIIScrollbarProps {
  scrollProgress: number;
}

export function ASCIIScrollbar({ scrollProgress }: ASCIIScrollbarProps) {
  const totalBars = 20;
  const thumbPosition = Math.floor(scrollProgress * totalBars);
  const bars = Array.from({ length: totalBars }, (_, i) => 
    i === thumbPosition ? '▓' : '░'
  );

  return (
    <div 
      className="fixed right-4 flex flex-col gap-0 text-xs z-40"
      style={{
        top: '60px',
        color: 'var(--text-dim)',
        lineHeight: '1.2',
      }}
    >
      {bars.map((bar, i) => (
        <div key={i}>{bar}</div>
      ))}
    </div>
  );
}
