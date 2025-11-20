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

  // Prepare data
  const gitChart = GitAdapter.toCommitChart(mockReviewData.git);
  const gitStats = GitAdapter.formatStats(mockReviewData.git);
  const stackBars = StackAdapter.toHorizontalBars(mockReviewData.techStack);
  const stackFrameworks = StackAdapter.toFrameworkBars(mockReviewData.techStack);
  const flowHeatmap = FlowAdapter.toBlockMap(mockReviewData.workflow);
  const flowStats = FlowAdapter.formatStats(mockReviewData.workflow);

  const replayAnimation = useCallback(() => {
    if (timelineRef.current) {
      timelineRef.current.restart();
      setPhase('idle');
      setStatus('IDLE');
      setShowMenu(false);
    }
  }, []);

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

    // Auth sequence
    const authLines = [
      '> Initializing session...',
      '> Authenticating as @' + mockReviewData.user.username + '...',
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

    // Show session established
    tl.to('.auth-session', { opacity: 1, duration: 0.5 }, '+=0.3')
      .to('.auth-countdown', { opacity: 1, duration: 0.3 }, '+=0.5');

    tl.add(() => setPhase('git'), '+=1.5');

    // Hide auth, show data page
    if (authPageRef.current && dataPageRef.current) {
      tl.to(authPageRef.current, { opacity: 0, duration: 0.3 })
        .set(authPageRef.current, { display: 'none' })
        .set(dataPageRef.current, { display: 'block' });
    }

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

    // Scroll to stack module
    tl.to(dataPageRef.current, { 
      scrollTo: { y: '.stack-module', offsetY: 50 },
      duration: 1, 
      ease: 'power2.inOut' 
    });

    // Stack module
    tl.set('.stack-module', { opacity: 1, visibility: 'visible' })
      .from('.stack-title', { opacity: 0, duration: 0.5 })
      .to('.stack-log-0', { text: '> Resolving dependency tree...', duration: 0.8 })
      .to('.stack-check-0', { opacity: 1, duration: 0.2 })
      .to('.stack-log-1', { text: `> Analyzing ${mockReviewData.techStack.totalPackages} packages across ${mockReviewData.techStack.totalProjects} projects...`, duration: 1 })
      .to('.stack-check-1', { opacity: 1, duration: 0.2 })
      .from('.stack-bars', { opacity: 0, duration: 1 });

    tl.add(() => setPhase('flow'), '+=2');

    // Scroll to flow module
    tl.to(dataPageRef.current, { 
      scrollTo: { y: '.flow-module', offsetY: 50 },
      duration: 1, 
      ease: 'power2.inOut' 
    });

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
      setShowMenu(true);
    }, '+=2');

    // Scroll to summary
    tl.to(dataPageRef.current, { 
      scrollTo: { y: '.summary-module', offsetY: 100 },
      duration: 1.5, 
      ease: 'power2.inOut' 
    });

    // Summary
    tl.set('.summary-module', { opacity: 1, visibility: 'visible' })
      .from('.summary-title', { opacity: 0, duration: 0.5 })
      .from('.summary-badge', { opacity: 0, scale: 0.8, duration: 1, ease: 'back.out' })
      .from('.summary-message', { opacity: 0, duration: 0.5 })
      .from('.summary-menu', { opacity: 0, duration: 0.5 });

    tl.play();
  }, []);

  // Initialize timeline and cursor animation
  useEffect(() => {
    // Main timeline for auth and data animations (stays paused until Enter)
    const mainTl = gsap.timeline({ 
      paused: true,
      onUpdate: function() {
        if (dataPageRef.current) {
          const scrollTop = dataPageRef.current.scrollTop;
          const scrollHeight = dataPageRef.current.scrollHeight - dataPageRef.current.clientHeight;
          setScrollProgress(scrollHeight > 0 ? scrollTop / scrollHeight : 0);
        }
      }
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
        role={mockReviewData.user.role}
      />
      <DataPage 
        ref={dataPageRef}
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
