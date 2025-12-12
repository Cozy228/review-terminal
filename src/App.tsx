import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { useTheme } from './hooks/useTheme';
import { useScrollController } from './hooks/useScrollController';
import { useAppMode } from './hooks/useAppMode';
import { useKeyboardNav } from './hooks/useKeyboardNav';
import { StatusBar } from './components/StatusBar';
import { ASCIIScrollbar } from './components/ASCIIScrollbar';
import { WindowChrome } from './components/WindowChrome';
import { IdlePage } from './pages/IdlePage';
import { DataPage } from './pages/DataPage';
import { ExecutiveDataPage } from './pages/ExecutiveDataPage';
import { ExecutiveEntryPage } from './pages/ExecutiveEntryPage';
import { AuthCallback } from './pages/AuthCallback';
import { mockReviewData } from './data/mockData';

gsap.registerPlugin(TextPlugin, ScrollToPlugin);

function App() {
  useTheme();
  const isAuthEnabled = import.meta.env.VITE_AUTH_ENABLED === 'true';

  const idlePageRef = useRef<HTMLDivElement>(null);
  const dataPageRef = useRef<HTMLDivElement>(null);
  const execPageRef = useRef<HTMLDivElement>(null);
  const execEntryPageRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const userScrollingRef = useRef(false);

  const setUserScrolling = useCallback((val: boolean) => {
    userScrollingRef.current = val;
  }, []);

  const {
    scrollTo: scrollToModule,
    progress: dataScrollProgress,
    setContainer: setDataContainer,
  } = useScrollController({
    contentSelector: '.data-scroll-content',
    setUserScrolling,
  });

  const {
    scrollTo: scrollToExecModule,
    progress: execScrollProgress,
    setContainer: setExecContainer,
  } = useScrollController({
    contentSelector: '.exec-scroll-content',
    setUserScrolling,
  });

  const {
    status,
    phase,
    showMenu,
    displayUser,
    isExecutiveMode,
    execShowMenu,
    execEmail,
    execEntryStatus,
    authStatus,
    authMessage,
    authErrorMessage,
    startAuthFlow,
    startDataTimeline,
    handleAuthComplete,
    replayExecAnimation,
    resetToIdle,
    handleExecutiveEmailSubmit,
  } = useAppMode({
    isAuthEnabled,
    idlePageRef,
    dataPageRef,
    execPageRef,
    execEntryPageRef,
    setDataContainer,
    setExecContainer,
    scrollToModule,
    scrollToExecModule,
    setUserScrolling,
  });

  useKeyboardNav({
    phase,
    isExecutiveMode,
    isAuthEnabled,
    startAuthFlow,
    handleAuthComplete,
    startDataTimeline,
    replayExecAnimation,
    resetToIdle,
  });

  useEffect(() => {
    let cursorTween: gsap.core.Tween | null = null;
    if (cursorRef.current) {
      cursorTween = gsap.to(cursorRef.current, {
        opacity: 0,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        repeatDelay: 0,
      });
    }
    return () => {
      cursorTween?.kill();
    };
  }, []);

  const scrollProgress = isExecutiveMode ? execScrollProgress : dataScrollProgress;
  const showScrollbar = phase !== 'idle' && phase !== 'auth';

  const isAuthCallbackRoute = window.location.pathname === (import.meta.env.VITE_AUTH_CALLBACK_PATH || '/auth/callback');
  const isExecutiveRoute = window.location.pathname === '/executive';

  if (isAuthCallbackRoute) {
    return <AuthCallback />;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <WindowChrome username={isExecutiveMode ? (execEmail || 'executive') : displayUser} />
      {!isExecutiveRoute ? (
        <IdlePage
          ref={idlePageRef}
          cursorRef={cursorRef}
          statusMessage={authMessage}
          errorMessage={authErrorMessage}
          isBusy={authStatus === 'auth' || authStatus === 'loading'}
          isAuthEnabled={isAuthEnabled}
        />
      ) : (
        <ExecutiveEntryPage
          ref={execEntryPageRef}
          cursorRef={cursorRef}
          onEmailSubmit={handleExecutiveEmailSubmit}
          statusMessage={execEntryStatus === 'loading' ? 'Loading executive dashboard...' : null}
          errorMessage={null}
          isBusy={execEntryStatus === 'loading'}
        />
      )}
      {!isExecutiveMode && (
        <DataPage
          ref={dataPageRef}
          displayUser={displayUser}
          reviewData={mockReviewData}
          showMenu={showMenu}
          onReplay={() => startDataTimeline(true)}
        />
      )}
      {isExecutiveMode && (
        <ExecutiveDataPage
          ref={execPageRef}
          showMenu={execShowMenu}
          onReplay={replayExecAnimation}
          onBack={resetToIdle}
        />
      )}

      {showScrollbar && <ASCIIScrollbar scrollProgress={scrollProgress} />}
      <StatusBar status={status} />
    </div>
  );
}

export default App;
