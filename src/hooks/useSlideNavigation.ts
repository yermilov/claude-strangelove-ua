import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { SlideDefinition } from '../types/slides';
import { deckPath } from '../utils/traversal';

interface UseSlideNavigationReturn {
  currentSlide: number;
  revealStage: number;
  /** position on the talk's line (see utils/traversal.ts), 0-based */
  step: number;
  totalSteps: number;
  goToSlide: (index: number) => void;
  goToSlideWithReveal: (slideIndex: number, revealStage: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  revealNext: () => void;
  revealPrev: () => void;
  handleCommand: (command: string) => void;
  isFirstSlide: boolean;
  isLastSlide: boolean;
}

// `#slide-N` is step N, 1-based — one id per reveal, rising through detours.
const stepFromHash = (total: number): number | null => {
  if (typeof window === 'undefined') return null;
  const match = window.location.hash.match(/^#slide-(\d+)$/);
  if (!match) return null;
  const n = parseInt(match[1], 10) - 1;
  return n >= 0 && n < total ? n : null;
};

export function useSlideNavigation(slides: SlideDefinition[], initialSlide: number = 0): UseSlideNavigationReturn {
  const path = useMemo(() => deckPath(slides), [slides]);
  const total = path.length;
  const last = total - 1;

  const stepOf = useCallback(
    (index: number, revealStage: number) => path.findIndex((s) => s.index === index && s.revealStage === revealStage),
    [path],
  );

  const [step, setStep] = useState(() => stepFromHash(total) ?? Math.max(0, stepOf(initialSlide, 0)));
  const stepRef = useRef(step);
  stepRef.current = step;

  const goToStep = useCallback(
    (n: number) => {
      const clamped = Math.max(0, Math.min(n, last));
      setStep(clamped);
      if (typeof window !== 'undefined') {
        const hash = `#slide-${clamped + 1}`;
        if (window.location.hash !== hash) window.history.replaceState(null, '', hash);
      }
    },
    [last],
  );

  const revealNext = useCallback(() => goToStep(stepRef.current + 1), [goToStep]);
  const revealPrev = useCallback(() => goToStep(stepRef.current - 1), [goToStep]);

  const goToSlide = useCallback(
    (index: number) => {
      const s = stepOf(Math.max(0, Math.min(index, slides.length - 1)), 0);
      if (s >= 0) goToStep(s);
    },
    [slides.length, stepOf, goToStep],
  );

  // Used by the PDF exporter, which addresses slides by array index.
  const goToSlideWithReveal = useCallback(
    (slideIndex: number, revealStage: number) => {
      const max = slides[slideIndex]?.maxRevealStages ?? 0;
      const s = stepOf(slideIndex, Math.max(0, Math.min(revealStage, max)));
      if (s >= 0) goToStep(s);
    },
    [slides, stepOf, goToStep],
  );

  // `next` / `prev` skip a slide's remaining reveals: to the first step on a
  // different slide, or back to the start of the previous run of steps.
  const nextSlide = useCallback(() => {
    const cur = stepRef.current;
    const i = path.findIndex((s, n) => n > cur && s.index !== path[cur].index);
    goToStep(i >= 0 ? i : last);
  }, [path, last, goToStep]);

  const prevSlide = useCallback(() => {
    let n = stepRef.current;
    while (n > 0 && path[n - 1].index === path[stepRef.current].index) n--;
    if (n === 0) return goToStep(0);
    n--;
    while (n > 0 && path[n - 1].index === path[n].index) n--;
    goToStep(n);
  }, [path, goToStep]);

  const handleCommand = useCallback(
    (command: string) => {
      const trimmed = command.trim().toLowerCase();
      if (!trimmed) return;

      // A number is a step id, as in the URL; a negative one counts from the end.
      const n = parseInt(trimmed, 10);
      if (!isNaN(n) && n > 0) return goToStep(n - 1);
      if (!isNaN(n) && n < 0) return goToStep(last + n);

      switch (trimmed) {
        case 'prev':
        case 'previous':
        case 'back':
        case 'b':
        case 'p':
          return prevSlide();
        case 'first':
        case 'start':
        case 'home':
          return goToStep(0);
        case 'last':
        case 'end':
          return goToStep(last);
        case 'reveal':
        case 'r':
        case 'move':
        case 'm':
          return revealNext();
        case 'next':
        case 'n':
          return nextSlide();
      }
    },
    [goToStep, last, prevSlide, revealNext, nextSlide],
  );

  // Keyboard navigation (when not focused on input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ':
        case 'PageDown':
        case 'Enter':
        case 'n':
        case 'N':
          e.preventDefault();
          revealNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'Backspace':
        case 'p':
        case 'P':
          e.preventDefault();
          revealPrev();
          break;
        case 'Home':
          e.preventDefault();
          goToStep(0);
          break;
        case 'End':
          e.preventDefault();
          goToStep(last);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [revealNext, revealPrev, goToStep, last]);

  // A hand-edited hash is a jump.
  useEffect(() => {
    const handleHashChange = () => {
      const s = stepFromHash(total);
      if (s !== null && s !== stepRef.current) setStep(s);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [total]);

  // Set the initial hash on mount.
  useEffect(() => {
    goToStep(stepRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const { index: currentSlide, revealStage } = path[step] ?? { index: 0, revealStage: 0 };

  return {
    currentSlide,
    revealStage,
    step,
    totalSteps: total,
    goToSlide,
    goToSlideWithReveal,
    nextSlide,
    prevSlide,
    revealNext,
    revealPrev,
    handleCommand,
    isFirstSlide: step === 0,
    isLastSlide: step === last,
  };
}
