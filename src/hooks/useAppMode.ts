import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import gsap from 'gsap';
import { useAuthFlow } from './useAuthFlow';
import { mockReviewData } from '../data/mockData';
import { resetRetroModules } from '../animations/utils';
import { createDataTimeline } from '../animations/dataTimeline';
import { createExecutiveTimeline } from '../animations/executiveTimeline';
import { downloadPdfFromElement } from '../utils/exportPdf';
import type { AnimationPhase, TerminalStatus } from '../types';

export interface UseAppModeOptions {
  isAuthEnabled: boolean;
  idlePageRef: RefObject<HTMLDivElement | null>;
  dataPageRef: RefObject<HTMLDivElement | null>;
  execPageRef: RefObject<HTMLDivElement | null>;
  execEntryPageRef: RefObject<HTMLDivElement | null>;
  setDataContainer: (el: HTMLElement | null) => void;
  setExecContainer: (el: HTMLElement | null) => void;
  scrollToModule: (selector: string) => void;
  scrollToExecModule: (selector: string) => void;
  setUserScrolling: (isScrolling: boolean) => void;
}

export function useAppMode({
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
}: UseAppModeOptions) {
  const [status, setStatus] = useState<TerminalStatus>('READY');
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const [showMenu, setShowMenu] = useState(false);
  const [displayUser, setDisplayUser] = useState<string>('guest');

  const [isExecutiveMode, setIsExecutiveMode] = useState(false);
  const [execShowMenu, setExecShowMenu] = useState(false);
  const [execEmail, setExecEmail] = useState<string>('');
  const [execEntryStatus, setExecEntryStatus] = useState<'idle' | 'loading'>('idle');

  const [authStatus, setAuthStatus] = useState<'idle' | 'auth' | 'loading' | 'error'>('idle');
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  const dataDelayTimerRef = useRef<number | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const exportInProgressRef = useRef(false);
  const exportStatusResetTimerRef = useRef<number | null>(null);

  const teardownDataScroll = useCallback(() => {
    setDataContainer(null);
  }, [setDataContainer]);

  const setupDataScroll = useCallback(() => {
    if (!dataPageRef.current) return;
    setDataContainer(dataPageRef.current);
  }, [dataPageRef, setDataContainer]);

  const teardownExecutiveScroll = useCallback(() => {
    setExecContainer(null);
  }, [setExecContainer]);

  const setupExecutiveScroll = useCallback(() => {
    if (!execPageRef.current) return;
    setExecContainer(execPageRef.current);

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const tl = createExecutiveTimeline({
      onPhaseChange: setPhase,
      onStatusChange: setStatus,
      onShowMenu: (show: boolean) => setExecShowMenu(show),
      scrollToModule: scrollToExecModule,
    });
    timelineRef.current = tl;
    tl.play(0);
  }, [execPageRef, scrollToExecModule, setExecContainer]);

  const clearDataDelayTimer = useCallback(() => {
    if (dataDelayTimerRef.current) {
      window.clearTimeout(dataDelayTimerRef.current);
      dataDelayTimerRef.current = null;
    }
  }, []);

  const clearExportStatusResetTimer = useCallback(() => {
    if (exportStatusResetTimerRef.current) {
      window.clearTimeout(exportStatusResetTimerRef.current);
      exportStatusResetTimerRef.current = null;
    }
  }, []);

  const startDataTimeline = useCallback(
    (isReplay: boolean = false) => {
      clearDataDelayTimer();

      setAuthStatus('idle');
      setAuthMessage(null);
      setAuthErrorMessage(null);
      setPhase('git');
      setStatus('PROCESSING...');
      setShowMenu(false);

      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      const tl = createDataTimeline({
        onPhaseChange: setPhase,
        onStatusChange: setStatus,
        onShowMenu: (show: boolean) => setShowMenu(show),
        scrollToModule,
        setupDataScroll,
        idlePageRef,
        dataPageRef,
        isReplay,
        setUserScrolling,
      });
      timelineRef.current = tl;
      tl.play();
    },
    [clearDataDelayTimer, dataPageRef, idlePageRef, scrollToModule, setupDataScroll, setUserScrolling]
  );

  const startSharedReportView = useCallback(
    (reportId: string) => {
      const username = reportId.trim() || 'guest';

      clearDataDelayTimer();

      setIsExecutiveMode(false);
      setExecShowMenu(false);
      setExecEmail('');
      setExecEntryStatus('idle');

      setAuthStatus('idle');
      setAuthMessage(null);
      setAuthErrorMessage(null);

      setDisplayUser(username);

      const tryStart = (attempt: number) => {
        if (dataPageRef.current) {
          startDataTimeline(false);
          return;
        }
        if (attempt >= 20) {
          startDataTimeline(false);
          return;
        }
        requestAnimationFrame(() => tryStart(attempt + 1));
      };

      tryStart(0);
    },
    [clearDataDelayTimer, dataPageRef, startDataTimeline]
  );

  const replayExecAnimation = useCallback(() => {
    if (execPageRef.current) {
      execPageRef.current.scrollTop = 0;
      setUserScrolling(false);
    }
    setPhase('git');
    setStatus('PROCESSING...');
    setExecShowMenu(false);
    setupExecutiveScroll();
  }, [execPageRef, setUserScrolling, setupExecutiveScroll]);

  const downloadPdf = useCallback(async () => {
    if (exportInProgressRef.current) return;
    exportInProgressRef.current = true;

    clearExportStatusResetTimer();
    const previousStatus = status;

    try {
      const exportAllowed = isExecutiveMode ? execShowMenu : showMenu;
      if (!exportAllowed) return;

      setStatus('EXPORTING...');

      const pageRoot = isExecutiveMode ? execPageRef.current : dataPageRef.current;
      const contentSelector = isExecutiveMode ? '.exec-scroll-content' : '.data-scroll-content';
      const contentRoot = pageRoot?.querySelector<HTMLElement>(contentSelector) ?? null;

      if (!contentRoot) {
        throw new Error(`PDF export root not found: ${contentSelector}`);
      }

      const nameToken = isExecutiveMode ? (execEmail || 'executive') : displayUser;
      const safeName = nameToken
        .replace(/[^a-z0-9._-]+/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      const filename = `2025-developer-review-${safeName || 'report'}-${Date.now()}.pdf`;

      const coverRoot = idlePageRef.current ?? execEntryPageRef.current;
      const coverSignatureName = isExecutiveMode ? (execEmail || 'executive') : displayUser;
      const coverSignature = coverSignatureName.includes('@')
        ? `— ${coverSignatureName}`
        : `— @${coverSignatureName}`;
      await downloadPdfFromElement({
        root: contentRoot,
        filename,
        cover: coverRoot,
        coverFit: 'contain',
        coverMarginMm: 0,
        coverDisclaimerLines: [
          'DISCLAIMER',
          'This PDF is a visual snapshot of the UI at export time.',
          'It may contain synthetic or incomplete data.',
        ],
        coverSignature,
      });

      setStatus(previousStatus);
    } catch (error) {
      console.error('PDF export failed', error);
      setStatus('ERROR');
      exportStatusResetTimerRef.current = window.setTimeout(() => {
        setStatus((current) => (current === 'ERROR' ? previousStatus : current));
        exportStatusResetTimerRef.current = null;
      }, 4000);
    } finally {
      exportInProgressRef.current = false;
    }
  }, [
    clearExportStatusResetTimer,
    dataPageRef,
    displayUser,
    execEmail,
    execPageRef,
    execShowMenu,
    execEntryPageRef,
    idlePageRef,
    isExecutiveMode,
    showMenu,
    status,
  ]);

  const handleExecutiveEmailSubmit = useCallback(
    (email: string) => {
      setExecEmail(email);
      setExecEntryStatus('loading');
      setStatus('LOADING...');

      if (execEntryPageRef.current) {
        gsap.to(execEntryPageRef.current, {
          opacity: 0,
          duration: 0.3,
          onComplete: () => {
            setIsExecutiveMode(true);
            setExecEntryStatus('idle');
          },
        });
      }
    },
    [execEntryPageRef]
  );

  useEffect(() => {
    if (isExecutiveMode && execPageRef.current) {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      teardownDataScroll();

      const container = execPageRef.current;
      container.scrollTop = 0;
      setUserScrolling(false);
      gsap.set(container, { opacity: 0 });
      gsap.to(container, {
        opacity: 1,
        duration: 0.4,
        onComplete: setupExecutiveScroll,
      });
    }
  }, [isExecutiveMode, execPageRef, setUserScrolling, setupExecutiveScroll, teardownDataScroll]);

  const handleAuthComplete = useCallback(
    (user?: string | null) => {
      const username = user || mockReviewData.user.username;
      setDisplayUser(username);
      setPhase('auth');
      setAuthStatus('loading');
      setAuthMessage('GitHub session established. Loading data...');
      setAuthErrorMessage(null);
      setStatus('LOADING...');

      clearDataDelayTimer();
      dataDelayTimerRef.current = window.setTimeout(() => {
        setAuthMessage(null);
        startDataTimeline();
      }, 5000);
    },
    [clearDataDelayTimer, startDataTimeline]
  );

  const { authStage, authError, fetchAndOpenPopup, resetAuth } = useAuthFlow({
    onSuccess: handleAuthComplete,
  });

  const startAuthFlow = useCallback(() => {
    if (!isAuthEnabled) return;
    if (authStatus === 'auth' || authStatus === 'loading') return;

    clearDataDelayTimer();
    setPhase('auth');
    setAuthStatus('auth');
    setAuthMessage('Redirecting to GitHub...');
    setAuthErrorMessage(null);
    setStatus('AUTHORIZING...');
    setShowMenu(false);

    resetAuth();
    void fetchAndOpenPopup();
  }, [authStatus, clearDataDelayTimer, fetchAndOpenPopup, isAuthEnabled, resetAuth]);

  const resetToIdle = useCallback(() => {
    clearDataDelayTimer();

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
    setExecEmail('');
    setExecEntryStatus('idle');

    setAuthStatus('idle');
    setAuthMessage(null);
    setAuthErrorMessage(null);

    resetAuth();
    resetRetroModules();

    if (window.location.pathname === '/executive' || window.location.pathname.startsWith('/report/view/')) {
      window.history.pushState({}, '', '/');
    }
  }, [clearDataDelayTimer, resetAuth, teardownExecutiveScroll]);

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
    clearDataDelayTimer();
    requestAnimationFrame(() => {
      setAuthStatus('error');
      setAuthMessage(null);
      setAuthErrorMessage(authError);
      setStatus('READY');
      setPhase('idle');
    });
  }, [authError, clearDataDelayTimer]);

  useEffect(() => {
    let resetTimer: number | null = null;

    const handleWheel = () => {
      setUserScrolling(true);
      if (resetTimer) {
        window.clearTimeout(resetTimer);
      }
      resetTimer = window.setTimeout(() => {
        setUserScrolling(false);
      }, 2000);
    };

    const dataPage = dataPageRef.current;
    const execPage = execPageRef.current;

    if (dataPage) {
      dataPage.addEventListener('wheel', handleWheel, { passive: true });
      dataPage.addEventListener('touchmove', handleWheel, { passive: true });
    }

    if (execPage) {
      execPage.addEventListener('wheel', handleWheel, { passive: true });
      execPage.addEventListener('touchmove', handleWheel, { passive: true });
    }

    return () => {
      if (resetTimer) {
        window.clearTimeout(resetTimer);
      }
      if (dataPage) {
        dataPage.removeEventListener('wheel', handleWheel);
        dataPage.removeEventListener('touchmove', handleWheel);
      }
      if (execPage) {
        execPage.removeEventListener('wheel', handleWheel);
        execPage.removeEventListener('touchmove', handleWheel);
      }
    };
  }, [isExecutiveMode, dataPageRef, execPageRef, setUserScrolling]);

  useEffect(() => {
    return () => {
      clearDataDelayTimer();
      clearExportStatusResetTimer();
      teardownExecutiveScroll();
      teardownDataScroll();
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [clearDataDelayTimer, clearExportStatusResetTimer, teardownDataScroll, teardownExecutiveScroll]);

  return {
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
  };
}
