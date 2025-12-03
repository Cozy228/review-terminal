import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useTheme } from './hooks/useTheme';
import { useAuthFlow } from './hooks/useAuthFlow';
import { StatusBar } from './components/StatusBar';
import { ASCIIScrollbar } from './components/ASCIIScrollbar';
import { WindowChrome } from './components/WindowChrome';
import { IdlePage } from './pages/IdlePage';
import { AuthPage } from './pages/AuthPage';
import { DataPage } from './pages/DataPage';
import { ExecutiveDataPage } from './pages/ExecutiveDataPage';
import { AuthCallback } from './pages/AuthCallback';
import { mockReviewData } from './data/mockData';
import { GitAdapter } from './adapters/GitAdapter';
import { StackAdapter } from './adapters/StackAdapter';
import { FlowAdapter } from './adapters/FlowAdapter';
import type { AnimationPhase, TerminalStatus } from './types';

gsap.registerPlugin(TextPlugin, ScrollTrigger);

function App() {
  const { theme, toggleTheme } = useTheme();
  const [status, setStatus] = useState<TerminalStatus>('IDLE');
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [displayUser, setDisplayUser] = useState<string>('guest');
  const [authDataReady, setAuthDataReady] = useState(false);
  
  // Executive mode state
  const [isExecutiveMode, setIsExecutiveMode] = useState(false);
  const [execShowMenu, setExecShowMenu] = useState(false);
  
  const idlePageRef = useRef<HTMLDivElement>(null);
  const authPageRef = useRef<HTMLDivElement>(null);
  const dataPageRef = useRef<HTMLDivElement>(null);
  const execPageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const userScrollingRef = useRef(false);
  const lenisRef = useRef<Lenis | null>(null);
  const lenisTickerRef = useRef<((time: number) => void) | null>(null);
  const lenisUpdateHandlerRef = useRef<((instance: Lenis) => void) | null>(null);
  const lenisProgressHandlerRef = useRef<((instance: Lenis) => void) | null>(null);
  const execTriggersRef = useRef<ScrollTrigger[]>([]);

  // Prepare data
  const gitChart = GitAdapter.toCommitChart(mockReviewData.git);
  const gitStats = GitAdapter.formatStatsWithIcons(mockReviewData.git);
  const stackBars = StackAdapter.toHorizontalBars(mockReviewData.techStack);
  const stackFrameworks = StackAdapter.toFrameworkBars(mockReviewData.techStack);
  const flowHeatmap = FlowAdapter.toBlockMap(mockReviewData.workflow);
  const flowStats = FlowAdapter.formatStatsWithIcons(mockReviewData.workflow);

  // Smooth auto-scroll helper
  const smoothAutoScroll = useCallback(() => {
    if (!dataPageRef.current || userScrollingRef.current) return;
    
    const container = dataPageRef.current;
    
    // Find all module elements
    const modules = container.querySelectorAll<HTMLElement>('.session-header, .git-module, .stack-module, .flow-module, .summary-module');
    
    // Find the last visible module (opacity > 0 and visibility: visible)
    let lastVisibleModule: HTMLElement | null = null;
    modules.forEach(module => {
      const style = window.getComputedStyle(module);
      const opacity = parseFloat(style.opacity);
      const visibility = style.visibility;
      
      if (opacity > 0 && visibility === 'visible') {
        lastVisibleModule = module;
      }
    });
    
    // If no visible module found, don't scroll
    if (!lastVisibleModule) return;
    
    // Calculate the bottom position of the last visible module
    const moduleRect = (lastVisibleModule as HTMLElement).getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // Calculate target scroll position to show the bottom of the last visible module
    // with some padding (80px from bottom of viewport)
    const moduleBottomRelativeToContainer = moduleRect.bottom - containerRect.top + container.scrollTop;
    const targetScroll = moduleBottomRelativeToContainer - container.clientHeight + 80;
    
    // Only scroll if we need to (target is below current scroll position)
    if (targetScroll > container.scrollTop) {
      gsap.to(container, {
        scrollTop: Math.max(0, targetScroll),
        duration: 0.6,
        ease: 'power1.out',
        overwrite: false
      });
    }
  }, []);

  const teardownExecutiveScroll = useCallback(() => {
    execTriggersRef.current.forEach(trigger => trigger.kill());
    execTriggersRef.current = [];

    if (lenisRef.current) {
      if (lenisUpdateHandlerRef.current) {
        lenisRef.current.off('scroll', lenisUpdateHandlerRef.current);
      }
      if (lenisProgressHandlerRef.current) {
        lenisRef.current.off('scroll', lenisProgressHandlerRef.current);
      }
      lenisRef.current.destroy();
      lenisRef.current = null;
    }

    if (lenisTickerRef.current) {
      gsap.ticker.remove(lenisTickerRef.current);
      lenisTickerRef.current = null;
    }
  }, []);

  const setupExecutiveScroll = useCallback(() => {
    const container = execPageRef.current;
    const content = container?.querySelector<HTMLElement>('.exec-scroll-content');
    if (!container) return;

    teardownExecutiveScroll();
    setExecShowMenu(false);
    setPhase('git');
    setStatus('BUILDING...');
    setScrollProgress(0);

    const modules = container.querySelectorAll<HTMLElement>('.exec-module');
    gsap.set(modules, { opacity: 1, y: 0, visibility: 'visible' });

    const sections = container.querySelectorAll<HTMLElement>('.exec-header, .exec-dimension-header, .exec-section, .exec-menu-section');
    sections.forEach(section => {
      gsap.set(section, { opacity: 0, y: 24, visibility: 'hidden' });
    });

    const lenis = new Lenis({
      wrapper: container,
      content: content || container,
      autoRaf: false
    });
    lenisRef.current = lenis;

    const onScrollUpdate = () => ScrollTrigger.update();
    const onProgressUpdate = (instance: Lenis) => setScrollProgress(instance.progress ?? 0);

    lenisUpdateHandlerRef.current = onScrollUpdate;
    lenisProgressHandlerRef.current = onProgressUpdate;

    lenis.on('scroll', onScrollUpdate);
    lenis.on('scroll', onProgressUpdate);

    const ticker = (time: number) => lenis.raf(time * 1000);
    lenisTickerRef.current = ticker;
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    lenis.scrollTo(0, { immediate: true });

    const registerTrigger = (element: HTMLElement) => {
      const isMenu = element.classList.contains('exec-menu-section');
      const trigger = ScrollTrigger.create({
        trigger: element,
        scroller: container,
        start: isMenu ? 'top 95%' : 'top 75%',
        onEnter: () => {
          gsap.to(element, { opacity: 1, y: 0, visibility: 'visible', duration: 1.8, ease: 'power2.out', overwrite: 'auto' });
          if (isMenu) {
            setExecShowMenu(true);
            setPhase('summary');
            setStatus('COMPLETE');
          }
        },
        onLeaveBack: () => {
          gsap.to(element, { opacity: 0, y: 16, visibility: 'hidden', duration: 0.7, ease: 'power1.out', overwrite: 'auto' });
          if (isMenu) {
            setExecShowMenu(false);
            setPhase('git');
            setStatus('BUILDING...');
          }
        }
      });

      execTriggersRef.current.push(trigger);
    };

    Array.from(sections).forEach(registerTrigger);
    ScrollTrigger.refresh();
  }, [teardownExecutiveScroll]);

  const replayAnimation = useCallback(() => {
    if (timelineRef.current && dataPageRef.current) {
      // Reset states
      setPhase('git');
      setStatus('BUILDING...');
      setShowMenu(false);
      
      // Reset scroll state
      dataPageRef.current.scrollTop = 0;
      userScrollingRef.current = false;
      
      // Kill current timeline
      timelineRef.current.kill();
      
      // Reset all modules to hidden
      gsap.set(['.session-header', '.git-module', '.stack-module', '.flow-module', '.summary-module'], {
        opacity: 0,
        visibility: 'hidden'
      });
      gsap.set('.session-countdown', { opacity: 0 });
      
      // Clear all text content
      [0, 1].forEach(i => {
        gsap.set(`.git-log-${i}`, { text: '' });
        gsap.set(`.git-check-${i}`, { opacity: 0 });
        gsap.set(`.stack-log-${i}`, { text: '' });
        gsap.set(`.stack-check-${i}`, { opacity: 0 });
        gsap.set(`.flow-log-${i}`, { text: '' });
        gsap.set(`.flow-check-${i}`, { opacity: 0 });
      });
      
      // Create new timeline for replay with auto-scroll on update
      const replayTl = gsap.timeline({
        onUpdate: smoothAutoScroll
      });
      
      // Show session header
      replayTl.set('.session-header', { visibility: 'visible' })
        .to('.session-header', { opacity: 1, y: 0, duration: 0.5 })
        .to('.session-countdown', { opacity: 1, duration: 0.3 }, '+=0.3')
        .to('.session-countdown', { opacity: 0, duration: 0.3 }, '+=1');

      // Git module
      replayTl.set('.git-module', { opacity: 1, visibility: 'visible' })
        .from('.git-title', { opacity: 0, duration: 0.5 })
        .to('.git-log-0', { text: '> Fetching commit history...', duration: 0.8 })
        .to('.git-check-0', { opacity: 1, duration: 0.2 })
        .to('.git-log-1', { text: `> Analyzing ${mockReviewData.git.totalCommits} commits across ${mockReviewData.techStack.totalProjects} repositories...`, duration: 1 })
        .to('.git-check-1', { opacity: 1, duration: 0.2 })
        .from('.git-chart', { opacity: 0, duration: 1 })
        .from('.git-stats', { opacity: 0, duration: 0.5, stagger: 0.2 });

      replayTl.add(() => setPhase('stack'), '+=2');

      // Stack module
      replayTl.set('.stack-module', { opacity: 1, visibility: 'visible' })
        .from('.stack-title', { opacity: 0, duration: 0.5 })
        .to('.stack-log-0', { text: '> Resolving dependency tree...', duration: 0.8 })
        .to('.stack-check-0', { opacity: 1, duration: 0.2 })
        .to('.stack-log-1', { text: `> Analyzing ${mockReviewData.techStack.totalPackages} packages across ${mockReviewData.techStack.totalProjects} projects...`, duration: 1 })
        .to('.stack-check-1', { opacity: 1, duration: 0.2 })
        .from('.stack-bars', { opacity: 0, duration: 1 })
        .from('.stack-frameworks', { opacity: 0, duration: 0.8 }, '-=0.3');

      replayTl.add(() => setPhase('flow'), '+=2');

      // Flow module
      replayTl.set('.flow-module', { opacity: 1, visibility: 'visible' })
        .from('.flow-title', { opacity: 0, duration: 0.5 })
        .to('.flow-log-0', { text: '> Syncing issue tracker...', duration: 0.8 })
        .to('.flow-check-0', { opacity: 1, duration: 0.2 })
        .to('.flow-log-1', { text: `> Processing ${mockReviewData.workflow.totalTickets} tickets from Jira...`, duration: 1 })
        .to('.flow-check-1', { opacity: 1, duration: 0.2 })
        .from('.flow-heatmap', { opacity: 0, duration: 1 })
        .from('.flow-stats', { opacity: 0, duration: 0.5, stagger: 0.2 });

      replayTl.add(() => {
        setPhase('summary');
        setStatus('COMPLETE');
      }, '+=2');

      // Summary
      replayTl.set('.summary-module', { opacity: 1, visibility: 'visible' })
        .from('.summary-title', { opacity: 0, duration: 0.5 })
        .from('.summary-badge', { opacity: 0, scale: 0.8, duration: 1, ease: 'back.out' })
        .from('.summary-message', { opacity: 0, duration: 0.5 })
        .add(() => setShowMenu(true))
        .from('.summary-menu', { opacity: 0, y: 10, duration: 0.5, ease: 'power2.out' });

      replayTl.play();
      timelineRef.current = replayTl;
    }
  }, [smoothAutoScroll]);

  const handleAuthComplete = useCallback((user?: string | null) => {
    console.log('handleAuthComplete called with user:', user);
    if (user) {
      setDisplayUser(user);
      console.log('Set displayUser to:', user);
    } else {
      setDisplayUser(mockReviewData.user.username);
      console.log('No user provided, using mock username:', mockReviewData.user.username);
    }

    const swapTl = gsap.timeline();
    swapTl
      // First, fade out the redirect card
      .to('.auth-redirect', { opacity: 0, duration: 0.4, ease: 'power2.inOut' })
      .set('.auth-redirect', { display: 'none' })
      // Prepare Pac-Man card
      .set('.auth-pacman', { display: 'block', opacity: 0, y: 10 })
      // Smoothly slide up auth content
      .to('.auth-content', { 
        y: -30, 
        duration: 0.6, 
        ease: 'power3.out' 
      })
      // Fade in and slide up Pac-Man card at the same time
      .to('.auth-pacman', { 
        opacity: 1,
        y: 0,
        duration: 0.6, 
        ease: 'power3.out' 
      }, '<'); // '<' means start at the same time as previous animation

    // Pac-Man eating pellets animation (SVG version)
    // Simplified: Only move right, then teleport back and repeat
    const pacmanTl = gsap.timeline({ repeat: -1 });
    
    // Calculate pellet positions: marginLeft 60px, gap 16px, pellet width 8px
    // Pellet centers: 60+4, 60+8+16+4, 60+8+16+8+16+4, etc.
    // = 64, 88, 112, 136, 160, 184
    const pelletPositions = [64, 88, 112, 136, 160, 184];
    const pacmanMouthPosition = 24; // Center of Pac-Man's mouth (48px width / 2)
    
    // Reset to start position
    pacmanTl.set('.auth-pacman-svg', { left: '0px', scaleX: 1 });
    pacmanTl.set('.auth-pellet', { opacity: 0.8 });
    
    // Move Pac-Man from left to right, eating pellets
    pacmanTl.to('.auth-pacman-svg', {
      left: '232px',
      duration: 2.4,
      ease: 'none',
      onUpdate: function() {
        const progress = this.progress();
        const pacmanLeft = progress * 232; // Current left position
        const pacmanMouth = pacmanLeft + pacmanMouthPosition;
        
        // Hide pellets when Pac-Man's mouth reaches them
        pelletPositions.forEach((pelletPos, i) => {
          const pellet = document.querySelector(`.auth-pellet[data-index="${i}"]`) as HTMLElement;
          if (pellet) {
            pellet.style.opacity = pacmanMouth >= pelletPos ? '0' : '0.8';
          }
        });
      }
    })
    // Brief pause at the end
    .to({}, { duration: 0.3 })
    // Quick fade out and teleport back
    .to('.auth-pacman-svg', { opacity: 0, duration: 0.2 })
    .set('.auth-pacman-svg', { left: '0px' })
    .set('.auth-pellet', { opacity: 0.8 })
    .to('.auth-pacman-svg', { opacity: 1, duration: 0.2 });

    // Simulate data load (5 seconds), then finish eating and continue
    gsap.delayedCall(5, () => {
      // Stop the looping animation
      pacmanTl.pause();
      
      // Update status text
      setAuthDataReady(true);
      
      // Get current position
      const currentLeft = gsap.getProperty('.auth-pacman-svg', 'left') as number;
      
      // Finish eating remaining pellets (always moving right)
      const finishTl = gsap.timeline();
      
      finishTl.to('.auth-pacman-svg', {
        left: '232px',
        duration: ((232 - currentLeft) / 232) * 2.4, // Proportional time
        ease: 'none',
        onUpdate: function() {
          const left = gsap.getProperty('.auth-pacman-svg', 'left') as number;
          const mouth = left + pacmanMouthPosition;
          pelletPositions.forEach((pelletPos, i) => {
            const pellet = document.querySelector(`.auth-pellet[data-index="${i}"]`) as HTMLElement;
            if (pellet) {
              pellet.style.opacity = mouth >= pelletPos ? '0' : '0.8';
            }
          });
        }
      });

      // Wait 3 more seconds after finishing, then resume timeline
      gsap.delayedCall(3, () => {
        const tl = timelineRef.current;
        if (!tl) return;
        const waitTime = tl.labels?.['auth-wait'];
        if (waitTime !== undefined && tl.time() < waitTime) {
          gsap.delayedCall(0.1, () => {
            if (tl.time() >= waitTime) tl.play();
          });
          return;
        }
        tl.play();
      });
    });
  }, []);

  const { authStage, authError, fetchAndOpenPopup, retryAuth, resetAuth } = useAuthFlow({
    onSuccess: handleAuthComplete,
  });

  const resetToIdle = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.pause(0);
    }
    teardownExecutiveScroll();
    setPhase('idle');
    setStatus('IDLE');
    setShowMenu(false);
    setDisplayUser('guest');
    setAuthDataReady(false);
    setIsExecutiveMode(false);
    setExecShowMenu(false);
    resetAuth();
    
    // Reset executive page visibility
    if (execPageRef.current) {
      gsap.set(execPageRef.current, { display: 'none' });
    }
    // Reset idle page visibility
    if (idlePageRef.current) {
      gsap.set(idlePageRef.current, { display: 'flex', opacity: 1 });
    }
  }, [resetAuth, teardownExecutiveScroll]);

  // Executive mode animation
  const startExecutiveAnimation = useCallback(() => {
    setIsExecutiveMode(true);
    setPhase('git');
    setStatus('BUILDING...');
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
  }, [setupExecutiveScroll]);

  const replayExecAnimation = useCallback(() => {
    if (execPageRef.current) {
      execPageRef.current.scrollTop = 0;
      userScrollingRef.current = false;
    }
    setPhase('git');
    setStatus('BUILDING...');
    setExecShowMenu(false);
    
    setupExecutiveScroll();
  }, [setupExecutiveScroll]);

  const startAnimation = useCallback(() => {
    if (!timelineRef.current) return;
    
    setPhase('auth');
    setStatus('BUILDING...');
    resetAuth();
    setAuthDataReady(false);
    
    const tl = timelineRef.current;
    gsap.set('.auth-redirect', { display: 'block', opacity: 0 });
    gsap.set('.auth-pacman', { display: 'none', opacity: 0 });
    gsap.set('.auth-content', { y: 0 }); // Reset auth content position
    
    // Hide idle page
    if (idlePageRef.current) {
      tl.to(idlePageRef.current, { opacity: 0, duration: 0.3 })
        .set(idlePageRef.current, { display: 'none' });
    }

    // Show auth page
    if (authPageRef.current) {
      tl.set(authPageRef.current, { display: 'flex', opacity: 0 })
        .to(authPageRef.current, { opacity: 1, duration: 0.3 });
    }

    // Auth sequence (only 3 lines now)
    const authLines = [
      '> Initializing session...',
      '> Loading personal metrics...',
      '> Establishing secure connection to github.com...'
    ];

    authLines.forEach((line, i) => {
      tl.to(`.auth-line-${i}`, { 
        text: line,
        duration: 0.8,
        ease: 'none'
      })
      .to(`.auth-check-${i}`, { 
        opacity: 1, 
        scale: 1.2,
        duration: 0.2 
      }, '-=0.2')
      .to(`.auth-check-${i}`, { scale: 1, duration: 0.1 });
    });

    // Show GitHub redirect and open popup
    tl.to('.auth-redirect', { opacity: 1, duration: 0.5 }, '+=0.5')
      .add(() => { void fetchAndOpenPopup(); }, '-=0')
      .addPause('auth-wait');

    tl.add(() => setPhase('git'));

    // Hide auth, show data page (fade out entire auth content as one unit)
    if (authPageRef.current && dataPageRef.current) {
      tl.to('.auth-content', { opacity: 0, duration: 0.4 })
        .to(authPageRef.current, { opacity: 0, duration: 0.2 })
        .set(authPageRef.current, { display: 'none' })
        .set(dataPageRef.current, { display: 'block' })
        .add(() => {
          // Reset scroll state and enable smooth auto-scroll for data page
          userScrollingRef.current = false;
          tl.eventCallback('onUpdate', smoothAutoScroll);
        });
    }

    // Show session header
    tl.set('.session-header', { visibility: 'visible' })
      .to('.session-header', { opacity: 1, y: 0, duration: 0.5 })
      .to('.session-countdown', { opacity: 1, duration: 0.3 }, '+=0.3')
      .to('.session-countdown', { opacity: 0, duration: 0.3 }, '+=1');

    // Git module
    tl.set('.git-module', { opacity: 1, visibility: 'visible' })
      .from('.git-title', { opacity: 0, duration: 0.5 })
      .to('.git-log-0', { text: '> Fetching commit history...', duration: 0.8 })
      .to('.git-check-0', { opacity: 1, duration: 0.2 })
      .to('.git-log-1', { text: `> Analyzing ${mockReviewData.git.totalCommits} commits across ${mockReviewData.techStack.totalProjects} repositories...`, duration: 1 })
      .to('.git-check-1', { opacity: 1, duration: 0.2 })
      .from('.git-chart', { opacity: 0, duration: 1 })
      .from('.git-stats', { opacity: 0, duration: 0.5, stagger: 0.2 });

    tl.add(() => setPhase('stack'), '+=2');

    // Stack module
    tl.set('.stack-module', { opacity: 1, visibility: 'visible' })
      .from('.stack-title', { opacity: 0, duration: 0.5 })
      .to('.stack-log-0', { text: '> Resolving dependency tree...', duration: 0.8 })
      .to('.stack-check-0', { opacity: 1, duration: 0.2 })
      .to('.stack-log-1', { text: `> Analyzing ${mockReviewData.techStack.totalPackages} packages across ${mockReviewData.techStack.totalProjects} projects...`, duration: 1 })
      .to('.stack-check-1', { opacity: 1, duration: 0.2 })
      .from('.stack-bars', { opacity: 0, duration: 1 })
      .from('.stack-frameworks', { opacity: 0, duration: 0.8 }, '-=0.3');

    tl.add(() => setPhase('flow'), '+=2');

    // Flow module
    tl.set('.flow-module', { opacity: 1, visibility: 'visible' })
      .from('.flow-title', { opacity: 0, duration: 0.5 })
      .to('.flow-log-0', { text: '> Syncing issue tracker...', duration: 0.8 })
      .to('.flow-check-0', { opacity: 1, duration: 0.2 })
      .to('.flow-log-1', { text: `> Processing ${mockReviewData.workflow.totalTickets} tickets from Jira...`, duration: 1 })
      .to('.flow-check-1', { opacity: 1, duration: 0.2 })
      .from('.flow-heatmap', { opacity: 0, duration: 1 })
      .from('.flow-stats', { opacity: 0, duration: 0.5, stagger: 0.2 });

    tl.add(() => {
      setPhase('summary');
      setStatus('COMPLETE');
    }, '+=2');

    // Summary
    tl.set('.summary-module', { opacity: 1, visibility: 'visible' })
      .from('.summary-title', { opacity: 0, duration: 0.5 })
      .from('.summary-badge', { opacity: 0, scale: 0.8, duration: 1, ease: 'back.out' })
      .from('.summary-message', { opacity: 0, duration: 0.5 })
      .add(() => setShowMenu(true))
      .from('.summary-menu', { opacity: 0, y: 10, duration: 0.5, ease: 'power2.out' });

    tl.play();
  }, [smoothAutoScroll, resetAuth, fetchAndOpenPopup]);

  // Initialize timeline and cursor animation
  useEffect(() => {
    // Main timeline for auth and data animations (stays paused until Enter)
    const mainTl = gsap.timeline({ 
      paused: true
    });

    timelineRef.current = mainTl;

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
      mainTl.kill();
    };
  }, [teardownExecutiveScroll]);

  // Update scroll progress and detect user scrolling
  useEffect(() => {
    const updateScrollProgress = () => {
      if (isExecutiveMode && lenisRef.current) {
        const progress = lenisRef.current.progress ?? 0;
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
    
    if (dataPage) {
      dataPage.addEventListener('scroll', updateScrollProgress);
      dataPage.addEventListener('wheel', handleWheel, { passive: true });
      dataPage.addEventListener('touchmove', handleWheel, { passive: true });
    }
    
    if (execPage && !lenisRef.current) {
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
      if (dataPage) {
        dataPage.removeEventListener('scroll', updateScrollProgress);
        dataPage.removeEventListener('wheel', handleWheel);
        dataPage.removeEventListener('touchmove', handleWheel);
      }
      if (execPage && !lenisRef.current) {
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
          startAnimation();
        } else if (e.key === 'e' || e.key === 'E') {
          startExecutiveAnimation();
        }
      } else if (phase === 'summary') {
        if (e.key === 'r' || e.key === 'R') {
          if (isExecutiveMode) {
            replayExecAnimation();
          } else {
            replayAnimation();
          }
        } else if (e.key === 'Escape' || e.key === 'b' || e.key === 'B') {
          resetToIdle();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [phase, isExecutiveMode, startAnimation, startExecutiveAnimation, replayAnimation, replayExecAnimation, resetToIdle]);

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
      />
      <AuthPage 
        ref={authPageRef} 
        username={mockReviewData.user.username}
        authStage={authStage}
        authError={authError}
        authDataReady={authDataReady}
        onRetry={retryAuth}
      />
      <DataPage 
        ref={dataPageRef}
        username={displayUser}
        role={mockReviewData.user.role}
        gitChart={gitChart}
        gitStats={gitStats}
        stackBars={stackBars}
        stackFrameworks={stackFrameworks}
        flowHeatmap={flowHeatmap}
        flowStats={flowStats}
        showMenu={showMenu}
        onReplay={replayAnimation}
      />
      <ExecutiveDataPage
        ref={execPageRef}
        showMenu={execShowMenu}
        onReplay={replayExecAnimation}
        onBack={resetToIdle}
      />

      {showScrollbar && <ASCIIScrollbar scrollProgress={scrollProgress} />}
      <StatusBar status={status} theme={theme} onToggleTheme={toggleTheme} />
    </div>
  );
}

export default App;
