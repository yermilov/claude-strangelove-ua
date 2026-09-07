import { useState, useEffect, useCallback } from 'react';
import { PresentationProps } from '../types/slides';
import { useSlideNavigation } from '../hooks/useSlideNavigation';
import { NavigationContext } from '../context/NavigationContext';
import { useTouchNavigation } from '../hooks/useTouchNavigation';
import { Slide } from './Slide';
import { TerminalInput } from './TerminalInput';
import { SlideProgress } from './SlideProgress';
import { Timer } from './Timer';
import { RotateHint } from './RotateHint';
import { preloadSlideAssets } from '../utils/preloadAssets';
import { exportRegistry } from './exportRegistry';

declare global {
  interface Window {
    __deckExport?: {
      slideCount: number;
      slideIdAt: (i: number) => string;
      maxRevealStagesAt: (i: number) => number;
      goTo: (i: number, revealStage: number) => void;
      waitForSettled: (slideId: string, timeoutMs?: number) => Promise<void>;
      reset: () => void;
    };
  }
}

const isExportMode =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('export') === '1';

const TIMER_STARTED_AT_KEY = 'timerStartedAt';
const TIMER_ACCUMULATED_KEY = 'timerAccumulated';
const THEME_KEY = 'theme';
type Theme = 'dark' | 'light';

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  if (theme === 'dark') {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = theme;
  }
}

function getInitialTheme(): Theme {
  if (typeof localStorage === 'undefined') return 'dark';
  return localStorage.getItem(THEME_KEY) === 'light' ? 'light' : 'dark';
}

function getInitialTimerState(): { seconds: number; running: boolean } {
  const startedAt = localStorage.getItem(TIMER_STARTED_AT_KEY);
  const accumulated = parseInt(localStorage.getItem(TIMER_ACCUMULATED_KEY) || '0', 10);

  if (startedAt) {
    const elapsed = Math.floor((Date.now() - parseInt(startedAt, 10)) / 1000);
    return { seconds: accumulated + elapsed, running: true };
  }
  return { seconds: accumulated, running: false };
}

export function Presentation({ slides, initialSlide = 0 }: PresentationProps) {
  const { currentSlide, goToSlide, goToSlideWithReveal, handleCommand: handleNavCommand, revealStage, revealNext, revealPrev } = useSlideNavigation(
    slides,
    initialSlide
  );

  // Theme state — applies `[data-theme]` on <html>, persists to localStorage.
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Expose Playwright-driven navigation API in export mode.
  useEffect(() => {
    if (!isExportMode) return;
    window.__deckExport = {
      slideCount: slides.length,
      slideIdAt: (i: number) => slides[i]?.id ?? '',
      maxRevealStagesAt: (i: number) => slides[i]?.maxRevealStages ?? 0,
      goTo: (i: number, r: number) => goToSlideWithReveal(i, r),
      waitForSettled: (id: string, timeoutMs?: number) => exportRegistry.waitForSettled(id, timeoutMs),
      reset: () => exportRegistry.reset(),
    };
    return () => {
      delete window.__deckExport;
    };
  }, [slides, goToSlideWithReveal]);

  const goToSlideById = useCallback((id: string) => {
    const index = slides.findIndex(s => s.id === id);
    if (index !== -1) goToSlide(index);
  }, [slides, goToSlide]);

  const { containerRef } = useTouchNavigation({ onNext: revealNext, onPrev: revealPrev });

  // Track current input text for interactive slides
  const [inputText, setInputText] = useState('');

  // Warm the HTTP cache for every downstream slide asset while the title
  // slide is on screen. Deferred to idle so the first paint is unblocked.
  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    if (typeof win.requestIdleCallback === 'function') {
      const handle = win.requestIdleCallback(preloadSlideAssets);
      return () => win.cancelIdleCallback?.(handle);
    }
    const timeout = window.setTimeout(preloadSlideAssets, 200);
    return () => window.clearTimeout(timeout);
  }, []);

  // Timer state with localStorage persistence
  const [timerSeconds, setTimerSeconds] = useState(() => getInitialTimerState().seconds);
  const [timerRunning, setTimerRunning] = useState(() => getInitialTimerState().running);

  useEffect(() => {
    if (!timerRunning) return;

    const interval = setInterval(() => {
      setTimerSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning]);

  const handleTimerStart = useCallback(() => {
    setTimerRunning(true);
    setTimerSeconds((currentSeconds) => {
      localStorage.setItem(TIMER_STARTED_AT_KEY, Date.now().toString());
      localStorage.setItem(TIMER_ACCUMULATED_KEY, currentSeconds.toString());
      return currentSeconds;
    });
  }, []);

  // Auto-start timer when leaving the title slide; reset when returning to it
  useEffect(() => {
    if (currentSlide === 0) {
      setTimerRunning(false);
      setTimerSeconds(0);
      localStorage.removeItem(TIMER_STARTED_AT_KEY);
      localStorage.removeItem(TIMER_ACCUMULATED_KEY);
    } else if (!timerRunning) {
      handleTimerStart();
    }
  }, [currentSlide]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCommand = useCallback((command: string) => {
    const trimmed = command.trim().toLowerCase();

    if (trimmed === 'dark' || trimmed === 'light') {
      setTheme(trimmed);
      return;
    }

    handleNavCommand(command);
  }, [handleNavCommand]);

  const activeSlide = slides[currentSlide];

  if (!activeSlide) {
    return null;
  }

  const slideContent =
    typeof activeSlide.content === 'function'
      ? activeSlide.content({ revealStage, inputText })
      : activeSlide.content;

  const slideTitle =
    typeof activeSlide.title === 'function'
      ? activeSlide.title({ revealStage, inputText })
      : activeSlide.title;

  // Progress bar weights every reveal across the deck equally: each slide
  // contributes (maxRevealStages + 1) units, so a slide with eight reveals
  // fills more of the bar than a single-shot slide. Consumed = all prior
  // slides in full + the current reveal stage within this slide.
  const revealUnits = slides.map((s) => (s.maxRevealStages ?? 0) + 1);
  const totalUnits = revealUnits.reduce((sum, u) => sum + u, 0);
  const consumedUnits =
    revealUnits.slice(0, currentSlide).reduce((sum, u) => sum + u, 0) +
    Math.min(revealStage, activeSlide.maxRevealStages ?? 0) +
    1;

  return (
    <NavigationContext.Provider value={{ goToSlideById }}>
    <div className="presentation">
      {!isExportMode && <RotateHint />}
      <div className="slide-container" ref={containerRef} key={activeSlide.id}>
        <Slide
          isActive
          notes={activeSlide.notes}
          background={activeSlide.background}
          slideId={activeSlide.id}
          asyncSettle={activeSlide.asyncSettle}
          title={slideTitle}
        >
          {slideContent}
        </Slide>
      </div>
      {!isExportMode && (
        <div className="input-bar">
          <Timer
            elapsedSeconds={timerSeconds}
            progress={totalUnits > 0 ? consumedUnits / totalUnits : 0}
          />
          <TerminalInput
            onCommand={handleCommand}
            onInputChange={setInputText}
            onArrowLeft={revealPrev}
            onArrowRight={revealNext}
            placeholder="type anything to continue, 'prev' to go back, or slide number..."
          />
          <SlideProgress
            current={consumedUnits}
            total={totalUnits}
            isFirst={currentSlide === Math.floor(slides.length / 2)}
            hidden={(currentSlide + 1) / slides.length <= 0.5}
          />
        </div>
      )}
    </div>
    </NavigationContext.Provider>
  );
}
