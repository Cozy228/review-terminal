import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import Lenis from 'lenis';
import { useTheme } from './hooks/useTheme';
import { useAuthFlow } from './hooks/useAuthFlow';
import { StatusBar } from './components/StatusBar';
import { ASCIIScrollbar } from './components/ASCIIScrollbar';
import { WindowChrome } from './components/WindowChrome';
import { IdlePage } from './pages/IdlePage';
import { DataPage } from './pages/DataPage';
import { ExecutiveDataPage } from './pages/ExecutiveDataPage';
import { AuthCallback } from './pages/AuthCallback';
import { mockReviewData } from './data/mockData';
import type { AnimationPhase, TerminalStatus } from './types';

gsap.registerPlugin(TextPlugin, ScrollToPlugin);

function App() {
  useTheme();
  const isAuthEnabled = import.meta.env.VITE_AUTH_ENABLED === 'true';
  const [status, setStatus] = useState<TerminalStatus>('READY');
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [displayUser, setDisplayUser] = useState<string>('guest');
  
  // Executive mode state
  const [isExecutiveMode, setIsExecutiveMode] = useState(false);
  const [execShowMenu, setExecShowMenu] = useState(false);
  
  const idlePageRef = useRef<HTMLDivElement>(null);
  const dataPageRef = useRef<HTMLDivElement>(null);
  const execPageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const userScrollingRef = useRef(false);
  const dataLenisRef = useRef<Lenis | null>(null);
  const dataLenisTickerRef = useRef<((time: number) => void) | null>(null);
  const dataLenisProgressHandlerRef = useRef<((instance: Lenis) => void) | null>(null);
  const dataDelayTimerRef = useRef<number | null>(null);
  const [authStatus, setAuthStatus] = useState<'idle' | 'auth' | 'loading' | 'error'>('idle');
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  const scrollToModule = useCallback((selector: string) => {
    const container = dataPageRef.current;
    if (!container) return;
    userScrollingRef.current = false;

    const target = container.querySelector<HTMLElement>(selector);
    if (!target) return;

    const lenis = dataLenisRef.current;
    const content = container.querySelector<HTMLElement>('.data-scroll-content');

    const centerScrollPos = () => {
      if (!content) return 0;

      const targetRect = target.getBoundingClientRect();
      const contentRect = content.getBoundingClientRect();
      const targetTopInContent = targetRect.top - contentRect.top;
      const containerHeight = container.clientHeight;

      return targetTopInContent - (containerHeight * 0.3);
    };

    requestAnimationFrame(() => {
      const destination = Math.max(0, centerScrollPos());

      if (lenis) {
        lenis.scrollTo(destination, {
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
        return;
      }
      const updateProgress = () => {
        const scrollHeight = container.scrollHeight - container.clientHeight;
        setScrollProgress(scrollHeight > 0 ? container.scrollTop / scrollHeight : 0);
      };

      gsap.killTweensOf(container);
      gsap.to(container, {
        scrollTo: { y: destination, autoKill: true },
        duration: 1.2,
        ease: 'power2.inOut',
        overwrite: true,
        onUpdate: updateProgress,
        onComplete: () => {
          userScrollingRef.current = false;
          updateProgress();
        }
      });
    });
  }, []);

  const resetRetroModules = useCallback(() => {
    const modules = [
      '.player-section',
      '.git-section',
      '.skills-section',
      '.delivery-section',
      '.cicd-section',
      '.copilot-section',
      '.learning-section',
      '.community-section',
      '.summary-section'
    ];
    gsap.set(modules, { opacity: 0, visibility: 'hidden', y: 12 });
    gsap.set(
      [
        '.player-command .command-text',
        '.git-command .command-text',
        '.skills-command .command-text',
        '.delivery-command .command-text',
        '.cicd-command .command-text',
        '.copilot-command .command-text',
        '.learning-command .command-text',
        '.community-command .command-text',
        '.summary-command .command-text',
      ],
      { text: '' }
    );
    gsap.set(
      [
        '.player-command',
        '.git-command',
        '.skills-command',
        '.delivery-command',
        '.cicd-command',
        '.copilot-command',
        '.learning-command',
        '.community-command',
        '.summary-command'
      ],
      { attr: { 'data-active': 'true' } }
    );
    gsap.set(
      [
        '.git-monthly-card',
        '.git-narrative',
        '.achievement-card',
        '.summary-section .retro-card',
        '.summary-menu',
        '.delivery-section .retro-card.is-red',
        '.cicd-section .retro-card',
        '.copilot-section .retro-card',
        '.learning-section .retro-card',
        '.community-section .retro-card'
      ],
      { opacity: 0, visibility: 'visible' }
    );

    // Hide individual highlights initially
    gsap.set('.highlight-text', { opacity: 0, y: 8 });

    // Hide contribution blocks initially so they can be revealed with stagger
    gsap.set('.contrib-block', { opacity: 0, scale: 0.8, y: 10 });
    gsap.set('.contrib-label', { opacity: 0 });

    // Hide all bar values initially - they should appear after bars animate
    gsap.set('.stat-row .value', { opacity: 0 });

    // Hide growth percentage text initially - should appear after score animates
    gsap.set('.summary-section .retro-card.is-gold .retro-card-note', { opacity: 0 });

    const barSelectors = [
      '.language-bar',
      '.framework-bar',
      '.level-bar',
      '.project-bar',
      '.build-success-bar',
      '.copilot-acceptance-bar'
    ];
    barSelectors.forEach((selector) => {
      gsap.utils.toArray<HTMLElement>(selector).forEach((el) => {
        const finalBar = el.dataset.bar || el.textContent || '';
        (el as HTMLElement).dataset.finalBar = finalBar;
        (el as HTMLElement).textContent = finalBar ? '░'.repeat(finalBar.length) : '';
      });
    });
  }, []);

  const animateBarText = useCallback((tl: gsap.core.Timeline, selector: string) => {
    const targets = gsap.utils.toArray<HTMLElement>(selector);
    if (!targets.length) return;

    tl.to(targets, {
      duration: 0.9,
      ease: 'steps(18)',
      text: {
        value: ((_index: number, target: Element) =>
          (target as HTMLElement).dataset.finalBar || (target as HTMLElement).dataset.bar || '') as unknown as string,
      },
      stagger: 0.08,
    });
  }, []);

  const animateBarValues = useCallback((tl: gsap.core.Timeline, barSelector: string) => {
    const barTargets = gsap.utils.toArray<HTMLElement>(barSelector);
    if (!barTargets.length) return;

    // Get the parent .stat-row elements and find their .value children
    const valueTargets = barTargets.map(bar => {
      const statRow = bar.closest('.stat-row');
      return statRow?.querySelector('.value');
    }).filter(Boolean);

    tl.to(valueTargets, {
      opacity: 1,
      duration: 0.2,
      stagger: 0.08, // Same stagger as bars
      ease: 'power2.out'
    }, '<1.2'); // Start 1.2s after bars start = 0.3s delay after 0.9s bar completes
  }, []);

  const teardownDataScroll = useCallback(() => {
    if (dataLenisRef.current) {
      if (dataLenisProgressHandlerRef.current) {
        dataLenisRef.current.off('scroll', dataLenisProgressHandlerRef.current);
      }
      dataLenisRef.current.destroy();
      dataLenisRef.current = null;
    }
    if (dataLenisTickerRef.current) {
      gsap.ticker.remove(dataLenisTickerRef.current);
      dataLenisTickerRef.current = null;
    }
  }, []);

  const setupDataScroll = useCallback(() => {
    const container = dataPageRef.current;
    if (!container) return;

    teardownDataScroll();

    const content = container.querySelector<HTMLElement>('.data-scroll-content');
    const lenis = new Lenis({
      wrapper: container,
      content: content || container,
      autoRaf: false,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    dataLenisRef.current = lenis;

    const onProgress = (instance: Lenis) => setScrollProgress(instance.progress ?? 0);
    dataLenisProgressHandlerRef.current = onProgress;
    lenis.on('scroll', onProgress);

    const ticker = (time: number) => lenis.raf(time * 1000);
    dataLenisTickerRef.current = ticker;
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    lenis.scrollTo(0, { immediate: true });
    setScrollProgress(0);
  }, [teardownDataScroll]);

  const teardownExecutiveScroll = useCallback(() => {
  }, []);

  const setupExecutiveScroll = useCallback(() => {
    const container = execPageRef.current;
    if (!container) return;

    teardownExecutiveScroll();
    setExecShowMenu(false);
    setPhase('git');
    setStatus('LOADING...');
    setScrollProgress(0);

    const modules = container.querySelectorAll<HTMLElement>('.exec-module');
    gsap.set(modules, { opacity: 1, y: 0, visibility: 'visible' });

    const sections = container.querySelectorAll<HTMLElement>('.exec-header, .exec-dimension-header, .exec-section, .exec-menu-section');
    sections.forEach(section => {
      gsap.set(section, { opacity: 0, y: 24, visibility: 'hidden' });
    });

    container.scrollTop = 0;

    gsap.to(sections, {
      opacity: 1,
      y: 0,
      visibility: 'visible',
      duration: 1.2,
      ease: 'power2.out',
      stagger: 0.1
    });
  }, [teardownExecutiveScroll]);

  // Executive mode animation
  const startExecutiveAnimation = useCallback(() => {
    teardownDataScroll();
    setIsExecutiveMode(true);
    setPhase('git');
    setStatus('PROCESSING...');
    setExecShowMenu(false);
    
    const tl = gsap.timeline();
    timelineRef.current = tl;
    
    // Hide idle page
    if (idlePageRef.current) {
      tl.to(idlePageRef.current, { opacity: 0, duration: 0.3 })
        .set(idlePageRef.current, { display: 'none' });
    }
    
    // Show executive page
    if (execPageRef.current) {
      tl.set(execPageRef.current, { display: 'block', opacity: 0 });
      execPageRef.current.scrollTop = 0;
      userScrollingRef.current = false;
      tl.to(execPageRef.current, { opacity: 1, duration: 0.4 });
    }
    
    tl.add(() => setupExecutiveScroll());

    tl.play();
  }, [setupExecutiveScroll, teardownDataScroll]);

  const replayExecAnimation = useCallback(() => {
    if (execPageRef.current) {
      execPageRef.current.scrollTop = 0;
      userScrollingRef.current = false;
    }
    setPhase('git');
    setStatus('PROCESSING...');
    setExecShowMenu(false);
    
    setupExecutiveScroll();
  }, [setupExecutiveScroll]);

  const startDataTimeline = useCallback((isReplay: boolean = false) => {
    if (dataDelayTimerRef.current) {
      window.clearTimeout(dataDelayTimerRef.current);
      dataDelayTimerRef.current = null;
    }
    setAuthStatus('idle');
    setAuthMessage(null);
    setAuthErrorMessage(null);
    setPhase('git');
    setStatus('PROCESSING...');
    setShowMenu(false);

    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    const tl = gsap.timeline();
    timelineRef.current = tl;

    // Only transition from idle page on first load, not on replay
    if (!isReplay) {
      if (idlePageRef.current) {
        tl.to(idlePageRef.current, { opacity: 0, duration: 0.3 })
          .set(idlePageRef.current, { display: 'none' });
      }

      if (dataPageRef.current) {
        gsap.set(dataPageRef.current, { display: 'block', opacity: 0 });
        dataPageRef.current.scrollTop = 0;
        userScrollingRef.current = false;
        setupDataScroll();
        tl.to(dataPageRef.current, { opacity: 1, duration: 0.3 });
      }
    } else {
      // Replay: page already visible, just reset scroll
      if (dataPageRef.current) {
        dataPageRef.current.scrollTop = 0;
        userScrollingRef.current = false;
      }
      setupDataScroll();
    }

    tl.add(() => {
      userScrollingRef.current = false;
      resetRetroModules();
    });

    tl
      .add(() => scrollToModule('.player-section'))
      .set('.player-section', { visibility: 'visible' }, '+=0.2')
      .to('.player-section', { opacity: 1, y: 0, duration: 1, ease: 'steps(10)' })
      .to('.player-command .command-text', { text: '> initialize --player --status', duration: 1.2, ease: 'none' }, '<')
      .add(() => { gsap.set('.player-command', { attr: { 'data-active': 'false' } }); }, '+=0.4')
      .from('.player-profile-card', { opacity: 0, y: 10, duration: 0.8, ease: 'power1.out' }, '+=0.3');

    tl
      .add(() => setPhase('git'), '+=2')
      .add(() => scrollToModule('.git-section'))
      .set('.git-section', { visibility: 'visible' }, '+=0.2')
      .to('.git-section', { opacity: 1, y: 0, duration: 0.8, ease: 'steps(10)' })
      .to('.git-command .command-text', { text: '> getdata --github --commits --prs', duration: 1.5, ease: 'none' })
      .add(() => { gsap.set('.git-command', { attr: { 'data-active': 'false' } }); }, '+=0.4')
      .from('.git-cards .retro-card', { opacity: 0, y: 12, duration: 1, stagger: 0.4, ease: 'power1.out' }, '+=0.3')
      .add(() => scrollToModule('.git-cards .retro-card:nth-child(6)'), '-=2.0')
      .add(() => scrollToModule('.git-monthly-card'), '+=1.5')
      .from('.git-monthly-card', { opacity: 0, y: 10, duration: 0.8, ease: 'power1.out' }, '+=0.2')
      .to('.contrib-block', {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.15,
        ease: 'back.out(1.7)'
      }, '+=0.3')
      .to('.contrib-label', { opacity: 1, duration: 0.3, stagger: 0.15 }, '-=1.5')
      .from('.git-narrative', { opacity: 0, duration: 0.6 }, '+=0.2')
      .add(() => scrollToModule('.git-collaborators-card'), '+=0.5')
      .from('.git-collaborators-card', { opacity: 0, y: 10, duration: 0.8, ease: 'power1.out' }, '+=0.2')
      .from('.collab-story', { opacity: 0, x: -10, duration: 0.6, stagger: 0.3, ease: 'power1.out' }, '+=0.2');

    tl
      .add(() => setPhase('stack'), '+=2')
      .add(() => scrollToModule('.skills-section'))
      .set('.skills-section', { visibility: 'visible' }, '+=0.2')
      .to('.skills-section', { opacity: 1, y: 0, duration: 0.8, ease: 'steps(10)' })
      .to('.skills-command .command-text', { text: '> analyze --languages --frameworks', duration: 1.5, ease: 'none' })
      .add(() => { gsap.set('.skills-command', { attr: { 'data-active': 'false' } }); }, '+=0.4')
      .from('.skills-section .retro-card', { opacity: 0, y: 12, duration: 1, stagger: 0.45, ease: 'power1.out' }, '+=0.3');
    animateBarText(tl, '.language-bar');
    animateBarValues(tl, '.language-bar');
    tl.add(() => scrollToModule('.language-bars'), '+=0.3');
    animateBarText(tl, '.framework-bar');
    animateBarValues(tl, '.framework-bar');
    tl.add(() => scrollToModule('.framework-bars'), '+=0.3');
    animateBarText(tl, '.level-bar');
    animateBarValues(tl, '.level-bar');
    tl.add(() => scrollToModule('.leveling-bars'), '+=0.3');

    tl
      .add(() => setPhase('flow'), '+=2')
      .add(() => scrollToModule('.delivery-section'))
      .set('.delivery-section', { visibility: 'visible' }, '+=0.2')
      .to('.delivery-section', { opacity: 1, y: 0, duration: 0.8, ease: 'steps(10)' })
      .to('.delivery-command .command-text', { text: '> getdata --jira --stories --bugs', duration: 1.5, ease: 'none' })
      .add(() => { gsap.set('.delivery-command', { attr: { 'data-active': 'false' } }); }, '+=0.4')
      .from('.delivery-cards .retro-card', { opacity: 0, y: 12, duration: 1, stagger: 0.45, ease: 'power1.out' }, '+=0.3')
      .to('.delivery-section .retro-card.is-red', { opacity: 1, duration: 0.8, ease: 'power1.out' }, '+=0.3');
    animateBarText(tl, '.project-bar');
    animateBarValues(tl, '.project-bar');
    tl.add(() => scrollToModule('.delivery-projects'), '+=0.3');

    // CI/CD Section
    tl
      .add(() => setPhase('cicd'), '+=2')
      .add(() => scrollToModule('.cicd-section'))
      .set('.cicd-section', { visibility: 'visible' }, '+=0.2')
      .to('.cicd-section', { opacity: 1, y: 0, duration: 0.8, ease: 'steps(10)' })
      .to('.cicd-command .command-text', { text: '> monitor --builds --deployments --pipelines', duration: 1.5, ease: 'none' })
      .add(() => { gsap.set('.cicd-command', { attr: { 'data-active': 'false' } }); }, '+=0.4')
      .from('.cicd-cards .retro-card', { opacity: 0, y: 12, duration: 1, stagger: 0.45, ease: 'power1.out' }, '+=0.3')
      .to('.cicd-section .retro-card', { opacity: 1, duration: 0.8, ease: 'power1.out' }, '+=0.3');
    animateBarText(tl, '.build-success-bar');
    animateBarValues(tl, '.build-success-bar');
    tl.add(() => scrollToModule('.cicd-section .retro-card'), '+=0.3');

    // Copilot Section
    tl
      .add(() => setPhase('copilot'), '+=2')
      .add(() => scrollToModule('.copilot-section'))
      .set('.copilot-section', { visibility: 'visible' }, '+=0.2')
      .to('.copilot-section', { opacity: 1, y: 0, duration: 0.8, ease: 'steps(10)' })
      .to('.copilot-command .command-text', { text: '> analyze --copilot --productivity', duration: 1.5, ease: 'none' })
      .add(() => { gsap.set('.copilot-command', { attr: { 'data-active': 'false' } }); }, '+=0.4')
      .from('.copilot-cards .retro-card', { opacity: 0, y: 12, duration: 1, stagger: 0.45, ease: 'power1.out' }, '+=0.3')
      .add(() => scrollToModule('.copilot-section .retro-card'), '+=0.3')
      .to('.copilot-section .retro-card', { opacity: 1, duration: 0.8, ease: 'power1.out' }, '+=0.2');
    animateBarText(tl, '.copilot-acceptance-bar');
    animateBarValues(tl, '.copilot-acceptance-bar');

    // Learning Section
    tl
      .add(() => setPhase('learning'), '+=2')
      .add(() => scrollToModule('.learning-section'))
      .set('.learning-section', { visibility: 'visible' }, '+=0.2')
      .to('.learning-section', { opacity: 1, y: 0, duration: 0.8, ease: 'steps(10)' })
      .to('.learning-command .command-text', { text: '> getdata --courses --certifications --growth', duration: 1.5, ease: 'none' })
      .add(() => { gsap.set('.learning-command', { attr: { 'data-active': 'false' } }); }, '+=0.4')
      .from('.learning-cards .retro-card', { opacity: 0, y: 12, duration: 1, stagger: 0.45, ease: 'power1.out' }, '+=0.3')
      .add(() => scrollToModule('.learning-section .retro-card'), '+=0.5')
      .to('.learning-section .retro-card', { opacity: 1, duration: 0.8, ease: 'power1.out' }, '+=0.2');

    // Community Section
    tl
      .add(() => setPhase('community'), '+=2')
      .add(() => scrollToModule('.community-section'))
      .set('.community-section', { visibility: 'visible' }, '+=0.2')
      .to('.community-section', { opacity: 1, y: 0, duration: 0.8, ease: 'steps(10)' })
      .to('.community-command .command-text', { text: '> getdata --bravos --events --contributions', duration: 1.5, ease: 'none' })
      .add(() => { gsap.set('.community-command', { attr: { 'data-active': 'false' } }); }, '+=0.4')
      .from('.community-cards .retro-card', { opacity: 0, y: 12, duration: 1, stagger: 0.45, ease: 'power1.out' }, '+=0.3')
      .add(() => scrollToModule('.community-section .retro-card'), '+=0.8')
      .to('.community-section .retro-card', { opacity: 1, duration: 0.8, ease: 'power1.out' }, '+=0.5');

    tl
      .add(() => setPhase('summary'), '+=2')
      .add(() => scrollToModule('.summary-section'))
      .set('.summary-section', { visibility: 'visible' }, '+=0.2')
      .to('.summary-section', { opacity: 1, y: 0, duration: 0.8, ease: 'steps(10)' })
      .to('.summary-command .command-text', { text: '> compute --score --achievements', duration: 1.5, ease: 'none' })
      .add(() => { gsap.set('.summary-command', { attr: { 'data-active': 'false' } }); }, '+=0.4')
      .from('.summary-section .retro-card.is-gold', { opacity: 0, y: 12, duration: 0.8, ease: 'power1.out' }, '+=0.3')
      .from('.summary-score', { textContent: 0, duration: 1.5, snap: { textContent: 1 }, ease: 'power1.inOut' }, '-=0.3')
      // Growth percentage appears after score animation finishes
      .to('.summary-section .retro-card.is-gold .retro-card-note', { opacity: 1, duration: 0.6, ease: 'power1.out' }, '+=0.2')
      .from('.summary-section .retro-card.is-blue', { opacity: 0, y: 12, duration: 0.8, ease: 'power1.out' }, '+=0.3')
      // Scroll to highlights before they appear
      .add(() => scrollToModule('.summary-section .retro-card.is-blue'), '+=0.3')
      // Animate highlights one by one with reading time
      .to('.highlight-text', { opacity: 1, y: 0, duration: 0.6, stagger: 1.5, ease: 'power1.out' }, '+=0.5')
      .add(() => scrollToModule('.achievement-card'), '+=0.8')
      // Longer delay before achievement cards appear, with longer stagger between each badge
      .to('.achievement-card', { opacity: 1, y: 0, duration: 0.8, stagger: 0.4, ease: 'power1.out' }, '+=1.0')
      .add(() => scrollToModule('.summary-menu'), '+=0.5')
      .set('.summary-menu', { visibility: 'visible' })
      .to('.summary-menu', { opacity: 1, y: 0, duration: 0.8, ease: 'power1.out' })
      .add(() => setShowMenu(true))
      .add(() => setStatus('COMPLETE'), '+=0.2');

    tl.play();
  }, [animateBarText, animateBarValues, resetRetroModules, scrollToModule, setShowMenu, setStatus, setupDataScroll]);

  const handleAuthComplete = useCallback((user?: string | null) => {
    const username = user || mockReviewData.user.username;
    setDisplayUser(username);
    setPhase('auth');
    setAuthStatus('loading');
    setAuthMessage('GitHub session established. Loading data...');
    setAuthErrorMessage(null);
    setStatus('LOADING...');
    if (dataDelayTimerRef.current) {
      window.clearTimeout(dataDelayTimerRef.current);
    }
    dataDelayTimerRef.current = window.setTimeout(() => {
      setAuthMessage(null);
      startDataTimeline();
    }, 5000);
  }, [startDataTimeline]);

  const { authStage, authError, fetchAndOpenPopup, resetAuth } = useAuthFlow({
    onSuccess: handleAuthComplete,
  });

  const startAuthFlow = useCallback(() => {
    if (authStatus === 'auth' || authStatus === 'loading') return;
    if (dataDelayTimerRef.current) {
      window.clearTimeout(dataDelayTimerRef.current);
      dataDelayTimerRef.current = null;
    }
    setPhase('auth');
    setAuthStatus('auth');
    setAuthMessage('Redirecting to GitHub...');
    setAuthErrorMessage(null);
    setStatus('AUTHORIZING...');
    setShowMenu(false);
    resetAuth();
    void fetchAndOpenPopup();
  }, [authStatus, fetchAndOpenPopup, resetAuth]);

  const resetToIdle = useCallback(() => {
    if (dataDelayTimerRef.current) {
      window.clearTimeout(dataDelayTimerRef.current);
      dataDelayTimerRef.current = null;
    }
    if (timelineRef.current) {
      timelineRef.current.pause(0);
    }
    teardownExecutiveScroll();
    setPhase('idle');
    setStatus('READY');
    setShowMenu(false);
    setDisplayUser('guest');
    setIsExecutiveMode(false);
    setExecShowMenu(false);
    setAuthStatus('idle');
    setAuthMessage(null);
    setAuthErrorMessage(null);
    resetAuth();
    resetRetroModules();
    
    if (execPageRef.current) {
      gsap.set(execPageRef.current, { display: 'none' });
    }
    if (dataPageRef.current) {
      gsap.set(dataPageRef.current, { display: 'none' });
    }
    if (idlePageRef.current) {
      gsap.set(idlePageRef.current, { display: 'flex', opacity: 1 });
    }
  }, [resetAuth, resetRetroModules, teardownExecutiveScroll]);

  useEffect(() => {
    if (authStatus !== 'auth') return;
    if (authStage === 'redirecting') {
      requestAnimationFrame(() => {
        setAuthMessage('Redirecting to GitHub...');
        setStatus('AUTHORIZING...');
      });
    } else if (authStage === 'loading') {
      requestAnimationFrame(() => {
        setAuthMessage('GitHub session established. Waiting for approval...');
        setStatus('LOADING...');
      });
    }
  }, [authStage, authStatus]);

  useEffect(() => {
    if (!authError) return;
    if (dataDelayTimerRef.current) {
      window.clearTimeout(dataDelayTimerRef.current);
      dataDelayTimerRef.current = null;
    }
    requestAnimationFrame(() => {
      setAuthStatus('error');
      setAuthMessage(null);
      setAuthErrorMessage(authError);
      setStatus('READY');
      setPhase('idle');
    });
  }, [authError]);

  // Initialize timeline and cursor animation
  useEffect(() => {
    timelineRef.current = gsap.timeline({ paused: true });

    // Separate cursor animation (plays immediately)
    if (cursorRef.current) {
      gsap.to(cursorRef.current, { 
        opacity: 0, 
        duration: 0.5, 
        repeat: -1, 
        yoyo: true,
        repeatDelay: 0
      });
    }

    return () => {
      teardownExecutiveScroll();
      teardownDataScroll();
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [teardownDataScroll, teardownExecutiveScroll]);

  // Update scroll progress and detect user scrolling
  useEffect(() => {
    const updateScrollProgress = () => {
      if (!isExecutiveMode && dataLenisRef.current) {
        const progress = dataLenisRef.current.progress ?? 0;
        setScrollProgress(progress);
        return;
      }

      const activeContainer = isExecutiveMode ? execPageRef.current : dataPageRef.current;
      if (activeContainer) {
        const scrollTop = activeContainer.scrollTop;
        const scrollHeight = activeContainer.scrollHeight - activeContainer.clientHeight;
        setScrollProgress(scrollHeight > 0 ? scrollTop / scrollHeight : 0);
      }
    };

    const handleWheel = () => {
      // User is manually scrolling
      userScrollingRef.current = true;
      // Re-enable auto-scroll after 2 seconds of no manual scrolling
      setTimeout(() => {
        userScrollingRef.current = false;
      }, 2000);
    };

    const dataPage = dataPageRef.current;
    const execPage = execPageRef.current;
    
    if (dataPage && !dataLenisRef.current) {
      dataPage.addEventListener('scroll', updateScrollProgress);
      dataPage.addEventListener('wheel', handleWheel, { passive: true });
      dataPage.addEventListener('touchmove', handleWheel, { passive: true });
    }
    
    if (execPage) {
      execPage.addEventListener('scroll', updateScrollProgress);
      execPage.addEventListener('wheel', handleWheel, { passive: true });
      execPage.addEventListener('touchmove', handleWheel, { passive: true });
    }
      
    // Also update on animation frame for smooth updates during GSAP scrollTo
    const rafUpdate = () => {
      updateScrollProgress();
      if (phase !== 'idle' && phase !== 'auth') {
        requestAnimationFrame(rafUpdate);
      }
    };
    if (phase !== 'idle' && phase !== 'auth') {
      requestAnimationFrame(rafUpdate);
    }

    return () => {
      if (dataPage && !dataLenisRef.current) {
        dataPage.removeEventListener('scroll', updateScrollProgress);
        dataPage.removeEventListener('wheel', handleWheel);
        dataPage.removeEventListener('touchmove', handleWheel);
      }
      if (execPage) {
        execPage.removeEventListener('scroll', updateScrollProgress);
        execPage.removeEventListener('wheel', handleWheel);
        execPage.removeEventListener('touchmove', handleWheel);
      }
    };
  }, [phase, isExecutiveMode]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (phase === 'idle') {
        if (e.key === 'Enter' || e.key === ' ') {
          if (isAuthEnabled) {
            startAuthFlow();
          } else {
            // Skip auth and go directly to data timeline
            handleAuthComplete(null);
          }
        } else if (e.key === 'e' || e.key === 'E') {
          startExecutiveAnimation();
        }
      } else if (phase === 'summary') {
        if (e.key === 'r' || e.key === 'R') {
          if (isExecutiveMode) {
            replayExecAnimation();
          } else {
            startDataTimeline(true);
          }
        } else if (e.key === 'Escape' || e.key === 'b' || e.key === 'B') {
          resetToIdle();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [phase, isExecutiveMode, isAuthEnabled, startAuthFlow, handleAuthComplete, startExecutiveAnimation, replayExecAnimation, resetToIdle, startDataTimeline]);

  const showScrollbar = phase !== 'idle' && phase !== 'auth';

  const isAuthCallbackRoute = window.location.pathname === (import.meta.env.VITE_AUTH_CALLBACK_PATH || '/auth/callback');

  if (isAuthCallbackRoute) {
    return <AuthCallback />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <WindowChrome username={isExecutiveMode ? 'executive' : displayUser} />
      <IdlePage
        ref={idlePageRef}
        cursorRef={cursorRef}
        onExecutiveMode={startExecutiveAnimation}
        statusMessage={authMessage}
        errorMessage={authErrorMessage}
        isBusy={authStatus === 'auth' || authStatus === 'loading'}
        isAuthEnabled={isAuthEnabled}
      />
      <DataPage 
        ref={dataPageRef}
        displayUser={displayUser}
        reviewData={mockReviewData}
        showMenu={showMenu}
        onReplay={() => startDataTimeline(true)}
      />
      <ExecutiveDataPage
        ref={execPageRef}
        showMenu={execShowMenu}
        onReplay={replayExecAnimation}
        onBack={resetToIdle}
      />

      {showScrollbar && <ASCIIScrollbar scrollProgress={scrollProgress} />}
      <StatusBar status={status} />
    </div>
  );
}

export default App;
