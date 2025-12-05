import { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';

type MatrixHighPerfProps = {
  text: string;
  chars?: string;
  colorMatrix?: string;
  colorFinal?: string;
  fontSize?: number;
  fontFamily?: string;
  className?: string;
  startDelay?: number;
  onComplete?: () => void;
  lineFinalColors?: string[];
  initialColor?: string;
  resolveCssVars?: boolean;
};

const DEFAULTS = {
  chars: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  colorMatrix: '#00FF41',
  colorFinal: '#FFFFFF',
  fontSize: 20,
  fontFamily: undefined,
  startDelay: 0.8,
};

const getRandomChar = (chars: string) => chars[Math.floor(Math.random() * chars.length)];

const MatrixHighPerf = ({
  text,
  chars = DEFAULTS.chars,
  colorMatrix = DEFAULTS.colorMatrix,
  colorFinal = DEFAULTS.colorFinal,
  fontSize = DEFAULTS.fontSize,
  fontFamily = DEFAULTS.fontFamily,
  className,
  startDelay = DEFAULTS.startDelay,
  onComplete,
  lineFinalColors,
  initialColor,
  resolveCssVars = true,
}: MatrixHighPerfProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const titleCanvasRef = useRef<HTMLCanvasElement>(null);

  const resolveColor = useCallback((value: string | undefined, fallback: string) => {
    if (!value) return fallback;
    if (!resolveCssVars) return value;
    try {
      if (value.startsWith('var(')) {
        const varName = value.slice(4, -1).trim();
        const resolved = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        return resolved || fallback;
      }
      return value;
    } catch {
      return fallback;
    }
  }, [resolveCssVars]);

  const getResolvedFontFamily = useCallback(() => {
    if (fontFamily) return fontFamily;
    try {
      const body = document.body;
      const computed = getComputedStyle(body).fontFamily;
      return computed || 'monospace';
    } catch {
      return 'monospace';
    }
  }, [fontFamily]);

  // Background rain (lightweight)
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const cols = Math.floor(width / 20);
    const drops = new Array(cols).fill(0).map(() => Math.random() * -100);

    const drawRain = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#00662a';
      ctx.font = `16px ${getResolvedFontFamily()}`;

      for (let i = 0; i < drops.length; i++) {
        const char = getRandomChar(chars);
        ctx.fillText(char, i * 20, drops[i] * 20);
        if (drops[i] * 20 > height && Math.random() > 0.98) drops[i] = 0;
        drops[i]++;
      }
    };

    const interval = setInterval(drawRain, 50);
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [chars, getResolvedFontFamily]);

  // Foreground title canvas
  useEffect(() => {
    const canvas = titleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const colorMatrixResolved = resolveColor(colorMatrix, DEFAULTS.colorMatrix);
    const initialResolved = resolveColor(initialColor, colorMatrixResolved);
    const lineColorResolved = lineFinalColors?.map((c) => resolveColor(c, colorFinal));
    const finalColorResolved = resolveColor(colorFinal, DEFAULTS.colorFinal);
    const resolvedFontFamily = getResolvedFontFamily();

    const lines = (() => {
      const raw = text.split('\n');
      if (raw.length && raw[0].trim() === '') raw.shift();
      if (raw.length && raw[raw.length - 1].trim() === '') raw.pop();
      return raw;
    })();

    const grid: Array<{
      char: string;
      x: number;
      y: number;
      progress: number;
      current: string;
      color: string;
      finalColor: string;
    }> = [];

    const maxLineLength = Math.max(...lines.map((l) => l.length));
    const charWidth = fontSize * 0.6;
    const lineHeight = fontSize * 1;
    const totalWidth = maxLineLength * charWidth;
    const totalHeight = lines.length * lineHeight;
    const startX = (width - totalWidth) / 2;
    const startY = (height - totalHeight) / 2;

    lines.forEach((line, row) => {
      line.split('').forEach((char, col) => {
        if (char.trim() === '') return;
        grid.push({
          char,
          x: startX + col * charWidth,
          y: startY + row * lineHeight,
          progress: 0,
          current: getRandomChar(chars),
          color: initialResolved,
          finalColor: lineColorResolved?.[row] ?? finalColorResolved,
        });
      });
    });

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.font = `bold ${fontSize}px ${resolvedFontFamily}`;
      ctx.textBaseline = 'top';

      grid.forEach((cell) => {
        const t = Math.min(1, cell.progress);
        if (t < 1) {
          if (Math.random() < 0.3) {
            cell.current = getRandomChar(chars);
          }
          // 初期白 → 过渡绿
          if (t < 0.4) {
            ctx.fillStyle = initialResolved;
          } else {
            ctx.fillStyle = colorMatrixResolved;
          }
          ctx.globalAlpha = Math.min(1, t * 1.6);
        } else {
          cell.current = cell.char;
          ctx.fillStyle = cell.color;
          ctx.globalAlpha = 1;
        }

        ctx.fillText(cell.current, cell.x, cell.y);
      });

      requestAnimationFrame(render);
    };

    const rafId = requestAnimationFrame(render);

    const tl = gsap.timeline({ delay: startDelay });

    tl.to(grid, {
      progress: 1,
      duration: 2.8,
      stagger: { amount: 1.8, from: 'random' },
      ease: 'power2.out',
    })
      .to(
        grid,
        {
          color: (_i, target: { finalColor: string }) => target.finalColor,
          duration: 1.2,
        },
        '<0.4'
      )
      .eventCallback('onComplete', onComplete || null);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dprNew = window.devicePixelRatio || 1;
      canvas.width = width * dprNew;
      canvas.height = height * dprNew;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dprNew, dprNew);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      tl.kill();
      window.removeEventListener('resize', handleResize);
    };
  }, [chars, colorFinal, colorMatrix, fontFamily, fontSize, startDelay, text, onComplete, initialColor, lineFinalColors, resolveCssVars, resolveColor, getResolvedFontFamily]);

  return (
    <div ref={containerRef} className={className} style={{ width: '100vw', height: '100vh' }}>
      <canvas
        ref={bgCanvasRef}
        className="absolute inset-0 z-0 pointer-events-none transition-opacity"
        style={{ opacity: 0.45 }}
      />
      <canvas ref={titleCanvasRef} className="absolute inset-0 z-10 pointer-events-none" />
    </div>
  );
};

export default MatrixHighPerf;

