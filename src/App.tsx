import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useTheme } from './hooks/useTheme';
import { StatusBar } from './components/StatusBar';
import { ASCIIScrollbar } from './components/ASCIIScrollbar';
import { IdlePage } from './pages/IdlePage';
import { AuthPage } from './pages/AuthPage';
import { DataPage } from './pages/DataPage';
import { mockReviewData } from './data/mockData';
import { GitAdapter } from './adapters/GitAdapter';
import { StackAdapter } from './adapters/StackAdapter';
import { FlowAdapter } from './adapters/FlowAdapter';
import type { AnimationPhase, TerminalStatus } from './types';

gsap.registerPlugin(TextPlugin, ScrollToPlugin);

function App() {
  const { theme, toggleTheme } = useTheme();
  const [status, setStatus] = useState<TerminalStatus>('IDLE');
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  
  const idlePageRef = useRef<HTMLDivElement>(null);
  const authPageRef = useRef<HTMLDivElement>(null);
  const dataPageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const userScrollingRef = useRef(false);

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

  const resetToIdle = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.pause(0);
      setPhase('idle');
      setStatus('IDLE');
      setShowMenu(false);
    }
  }, []);

  const startAnimation = useCallback(() => {
    if (!timelineRef.current) return;
    
    setPhase('auth');
    setStatus('BUILDING...');
    
    const tl = timelineRef.current;
    
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

    // Show GitHub redirect
    tl.to('.auth-redirect', { opacity: 1, duration: 0.5 }, '+=0.5')
      .to('.auth-redirect', { opacity: 0, duration: 0.3 }, '+=1.5');

    tl.add(() => setPhase('git'), '+=0.5');

    // Hide auth, show data page
    if (authPageRef.current && dataPageRef.current) {
      tl.to(authPageRef.current, { opacity: 0, duration: 0.3 })
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
  }, [smoothAutoScroll]);

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
      mainTl.kill();
    };
  }, []);


  // Update scroll progress and detect user scrolling
  useEffect(() => {
    const updateScrollProgress = () => {
      if (dataPageRef.current) {
        const scrollTop = dataPageRef.current.scrollTop;
        const scrollHeight = dataPageRef.current.scrollHeight - dataPageRef.current.clientHeight;
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
    if (dataPage) {
      dataPage.addEventListener('scroll', updateScrollProgress);
      dataPage.addEventListener('wheel', handleWheel, { passive: true });
      dataPage.addEventListener('touchmove', handleWheel, { passive: true });
      
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
    }

    return () => {
      if (dataPage) {
        dataPage.removeEventListener('scroll', updateScrollProgress);
        dataPage.removeEventListener('wheel', handleWheel);
        dataPage.removeEventListener('touchmove', handleWheel);
      }
    };
  }, [phase]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (phase === 'idle' && (e.key === 'Enter' || e.key === ' ')) {
        startAnimation();
      } else if (phase === 'summary') {
        if (e.key === 'r' || e.key === 'R') {
          replayAnimation();
        } else if (e.key === 'Escape') {
          resetToIdle();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [phase, startAnimation, replayAnimation, resetToIdle]);

  const showScrollbar = phase !== 'idle' && phase !== 'auth';

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <IdlePage ref={idlePageRef} cursorRef={cursorRef} />
      <AuthPage 
        ref={authPageRef} 
        username={mockReviewData.user.username}
      />
      <DataPage 
        ref={dataPageRef}
        username={mockReviewData.user.username}
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

      {showScrollbar && <ASCIIScrollbar scrollProgress={scrollProgress} />}
      <StatusBar status={status} theme={theme} onToggleTheme={toggleTheme} />
    </div>
  );
}

export default App;
