import { useEffect, useRef, useCallback, useState } from 'react';
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
import { Toast, type ToastState } from './components/Toast';
import { IdlePage } from './pages/IdlePage';
import { DataPage } from './pages/DataPage';
import { ExecutiveDataPage } from './pages/ExecutiveDataPage';
import { ExecutiveEntryPage } from './pages/ExecutiveEntryPage';
import { AuthCallback } from './pages/AuthCallback';
import { mockReviewData } from './data/mockData';
import { fetchMockReviewSeed } from './data/mockApi';
import { ReviewDataAdapter } from './adapters/ReviewDataAdapter';
import { copyTextToClipboard } from './utils/clipboard';
import { joinUrl, resolveBaseUrl } from './utils/url';

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
    startSharedReportView,
    handleAuthComplete,
    replayExecAnimation,
    downloadPdf,
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

  const [reviewData, setReviewData] = useState(mockReviewData);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const clearToastTimer = useCallback(() => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastState['tone'] = 'info', durationMs: number = 2600) => {
      clearToastTimer();
      setToast({ message, tone });
      toastTimerRef.current = window.setTimeout(() => {
        setToast(null);
        toastTimerRef.current = null;
      }, durationMs);
    },
    [clearToastTimer]
  );

  useEffect(() => {
    return () => {
      clearToastTimer();
    };
  }, [clearToastTimer]);

  const shareToVivaEngage = useCallback(async () => {
    const reportId = displayUser.trim() || 'guest';
    const apiBaseUrl = resolveBaseUrl(import.meta.env.VITE_API_BASE);
    const shadowUrl = joinUrl(apiBaseUrl, `share/card/${encodeURIComponent(reportId)}`);
    const shareText = `Check out my Yearly Review: ${shadowUrl}`;

    const engageTarget = (import.meta.env.VITE_VIVA_ENGAGE_URL as string | undefined) || 'https://web.yammer.com/main/feed';
    const popup = window.open(engageTarget, '_blank', 'noopener,noreferrer');

    const copied = await copyTextToClipboard(shareText);
    if (!copied) {
      showToast('Copy failed. Please copy the link manually.', 'error');
      return;
    }

    if (!popup) {
      showToast('Copied. Popups are blocked; open Viva Engage and paste manually.', 'info');
      return;
    }

    showToast('Copied. Paste it in the opened Viva Engage window.', 'success');
  }, [displayUser, showToast]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const res = await fetchMockReviewSeed(displayUser || 'guest');
      if (!res.ok) return;

      const body = await res.json();
      if (!body.ok) return;

      const next = ReviewDataAdapter.fromSeed(body.data);
      if (!cancelled) setReviewData(next);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [displayUser]);

  useKeyboardNav({
    phase,
    isExecutiveMode,
    isAuthEnabled,
    startAuthFlow,
    handleAuthComplete,
    startDataTimeline,
    replayExecAnimation,
    downloadPdf,
    shareReport: shareToVivaEngage,
    resetToIdle,
  });

  useEffect(() => {
    const match = window.location.pathname.match(/^\/report\/view\/([^/]+)$/);
    if (!match) return;

    const reportId = decodeURIComponent(match[1] || '').trim();
    if (!reportId) return;

    startSharedReportView(reportId);
  }, [startSharedReportView]);

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
          reviewData={reviewData}
          showMenu={showMenu}
          onReplay={() => startDataTimeline(true)}
          onDownload={downloadPdf}
          onShare={shareToVivaEngage}
        />
      )}
      {isExecutiveMode && (
        <ExecutiveDataPage
          ref={execPageRef}
          email={execEmail}
          showMenu={execShowMenu}
          onReplay={replayExecAnimation}
          onDownload={downloadPdf}
          onBack={resetToIdle}
        />
      )}

      {showScrollbar && <ASCIIScrollbar scrollProgress={scrollProgress} />}
      {toast && <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}
      <StatusBar status={status} />
    </div>
  );
}

export default App;
