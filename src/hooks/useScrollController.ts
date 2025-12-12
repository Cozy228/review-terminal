import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Lenis from 'lenis';

export interface ScrollControllerOptions {
  contentSelector: string;
  duration?: number;
  easing?: (t: number) => number;
  smoothWheel?: boolean;
  centerOffset?: number;
  setUserScrolling?: (isScrolling: boolean) => void;
}

const defaultEasing = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

export function useScrollController({
  contentSelector,
  duration = 1.2,
  easing,
  smoothWheel = true,
  centerOffset = 0.3,
  setUserScrolling,
}: ScrollControllerOptions) {
  const [progress, setProgress] = useState(0);

  const containerRef = useRef<HTMLElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const tickerRef = useRef<((time: number) => void) | null>(null);
  const progressHandlerRef = useRef<((instance: Lenis) => void) | null>(null);

  const teardown = useCallback(() => {
    if (lenisRef.current) {
      if (progressHandlerRef.current) {
        lenisRef.current.off('scroll', progressHandlerRef.current);
      }
      lenisRef.current.destroy();
      lenisRef.current = null;
    }

    if (tickerRef.current) {
      gsap.ticker.remove(tickerRef.current);
      tickerRef.current = null;
    }

    progressHandlerRef.current = null;
  }, []);

  const setContainer = useCallback(
    (container: HTMLElement | null) => {
      teardown();
      containerRef.current = container;

      if (!container) {
        setProgress(0);
        return;
      }

      const content = container.querySelector<HTMLElement>(contentSelector);
      const lenis = new Lenis({
        wrapper: container,
        content: content || container,
        autoRaf: false,
        duration,
        easing: easing ?? defaultEasing,
        smoothWheel,
      });

      lenisRef.current = lenis;

      const onProgress = (instance: Lenis) => setProgress(instance.progress ?? 0);
      progressHandlerRef.current = onProgress;
      lenis.on('scroll', onProgress);

      const ticker = (time: number) => lenis.raf(time * 1000);
      tickerRef.current = ticker;
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);

      lenis.scrollTo(0, { immediate: true });
      setProgress(0);
    },
    [contentSelector, duration, easing, smoothWheel, teardown]
  );

  const scrollTo = useCallback(
    (target: string | number) => {
      const container = containerRef.current;
      if (!container) return;

      let destination = 0;
      if (typeof target === 'number') {
        destination = target;
      } else {
        const el = container.querySelector<HTMLElement>(target);
        if (!el) return;

        const content = container.querySelector<HTMLElement>(contentSelector);
        if (!content) {
          destination = 0;
        } else {
          const targetRect = el.getBoundingClientRect();
          const contentRect = content.getBoundingClientRect();
          const targetTopInContent = targetRect.top - contentRect.top;
          const containerHeight = container.clientHeight;
          destination = targetTopInContent - containerHeight * centerOffset;
        }
      }

      setUserScrolling?.(false);

      requestAnimationFrame(() => {
        const y = Math.max(0, destination);
        const lenis = lenisRef.current;

        if (lenis) {
          lenis.scrollTo(y, {
            duration,
            easing: easing ?? defaultEasing,
          });
          return;
        }

        const updateProgress = () => {
          const scrollHeight = container.scrollHeight - container.clientHeight;
          setProgress(scrollHeight > 0 ? container.scrollTop / scrollHeight : 0);
        };

        gsap.killTweensOf(container);
        gsap.to(container, {
          scrollTo: { y, autoKill: true },
          duration,
          ease: 'power2.inOut',
          overwrite: true,
          onUpdate: updateProgress,
          onComplete: () => {
            setUserScrolling?.(false);
            updateProgress();
          },
        });
      });
    },
    [centerOffset, contentSelector, duration, easing, setUserScrolling]
  );

  useEffect(() => {
    return teardown;
  }, [teardown]);

  return { scrollTo, progress, setContainer };
}
