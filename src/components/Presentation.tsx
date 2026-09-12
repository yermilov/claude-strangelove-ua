import { useState, useEffect, useCallback } from 'react';
import { PresentationProps } from '../types/slides';
import { useSlideNavigation } from '../hooks/useSlideNavigation';
import { NavigationContext } from '../context/NavigationContext';
import { useTouchNavigation } from '../hooks/useTouchNavigation';
import { Slide } from './Slide';
import { TerminalInput } from './TerminalInput';
import { FlightTrack } from './FlightTrack';
import { RotateHint } from './RotateHint';
import { FwdaysLogo } from './FwdaysLogo';
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

  // The terminal is no longer parked in the frame: Esc calls it up over the
  // slide and Esc (or running a command) dismisses it. Everything the talk
  // actually needs mid-flight — arrows, space, PageUp/PageDown from the
  // clicker — is on the window handler in useSlideNavigation, which is
  // exactly why the input can be absent without costing any navigation.
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.preventDefault();
      // Escape typed INSIDE the field bubbles up to here too, so one key
      // both opens and closes it.
      setCommandOpen((open) => !open);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Leaving a slide drops any half-typed command with the overlay, so an
  // interactive slide never inherits the previous one's text.
  useEffect(() => {
    setCommandOpen(false);
    setInputText('');
  }, [currentSlide]);

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

    // A command is a one-shot: the overlay closes behind it, so the slide is
    // never left with a terminal sitting on top of it.
    setCommandOpen(false);

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
        {/* The conference mark the organiser asked us to carry. It hangs off
          * the stage rather than inside the slide, so it holds the same corner
          * regardless of what any one slide's layout does — and it stays in
          * export mode, because the PDF is what actually gets sent to them.
          * The stage, not the frame: the mark is bottom-anchored, and the
          * frame's bottom edge is the input bar, which the PDF does not have. */}
        {!activeSlide.hideConferenceMark && <FwdaysLogo className="fwdays-mark" />}
        <Slide
          isActive
          notes={activeSlide.notes}
          background={activeSlide.background}
          slideId={activeSlide.id}
          asyncSettle={activeSlide.asyncSettle}
          title={slideTitle}
          fullBleed={activeSlide.fullBleed}
        >
          {slideContent}
        </Slide>
      </div>
      {!isExportMode && commandOpen && (
        <div className="command-overlay">
          <TerminalInput
            onCommand={handleCommand}
            onInputChange={setInputText}
            onArrowLeft={revealPrev}
            onArrowRight={revealNext}
            placeholder="команда, номер слайда, 'prev' — або esc, щоб сховати"
          />
        </div>
      )}
      {!isExportMode && (
        <div className="deck-chrome">
          <FlightTrack
            elapsedSeconds={timerSeconds}
            progress={totalUnits > 0 ? consumedUnits / totalUnits : 0}
            onOpenCommand={() => setCommandOpen((open) => !open)}
          />
        </div>
      )}
    </div>
    </NavigationContext.Provider>
  );
}
