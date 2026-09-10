/**
 * Module-level export registry for PDF capture mode (?export=1).
 *
 * Some slides do async work in `useEffect` (e.g. fetches). The Playwright
 * exporter must wait for those to finish before screenshotting, otherwise
 * it captures a "fetching..." or empty state.
 *
 * Why a module-level singleton instead of React state: a `useState`
 * Set/Map would be replaced on each render, dropping pending waiters.
 * The lifecycle here outlives any component, so we keep the maps in
 * module scope. `reset()` is called between captures so re-export starts
 * clean.
 */

const settled = new Set<string>();

/** Slides that are mounted RIGHT NOW and settle on mount rather than by doing
 *  async work. Kept so `reset()` can re-assert them — see the comment there. */
const autoSettledMounted = new Set<string>();

const waiters = new Map<
  string,
  {
    resolve: () => void;
    reject: (e: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  }
>();

export interface DeckExportApi {
  markSlideSettled: (slideId: string) => void;
  markSlideError: (slideId: string, msg: string) => void;
  waitForSettled: (slideId: string, timeoutMs?: number) => Promise<void>;
  retainMounted: (slideId: string) => void;
  releaseMounted: (slideId: string) => void;
  reset: () => void;
}

export const exportRegistry: DeckExportApi = {
  markSlideSettled(slideId: string) {
    settled.add(slideId);
    const w = waiters.get(slideId);
    if (w) {
      clearTimeout(w.timer);
      w.resolve();
      waiters.delete(slideId);
    }
  },
  markSlideError(slideId: string, msg: string) {
    const err = new Error(`Slide ${slideId} failed during export: ${msg}`);
    const w = waiters.get(slideId);
    if (w) {
      clearTimeout(w.timer);
      w.reject(err);
      waiters.delete(slideId);
    }
    throw err;
  },
  waitForSettled(slideId: string, timeoutMs = 5000): Promise<void> {
    if (settled.has(slideId)) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        waiters.delete(slideId);
        reject(new Error(`Slide ${slideId} not settled in ${timeoutMs}ms`));
      }, timeoutMs);
      waiters.set(slideId, { resolve, reject, timer });
    });
  },
  /** Slide.tsx calls this for a mounted slide that settles on mount. */
  retainMounted(slideId: string) {
    autoSettledMounted.add(slideId);
  },
  releaseMounted(slideId: string) {
    autoSettledMounted.delete(slideId);
  },
  reset() {
    settled.clear();
    waiters.forEach(w => clearTimeout(w.timer));
    waiters.clear();

    // Re-assert whatever is on screen right now. A mounted slide has ALREADY
    // run the effect that marks it settled and will not run it again, so
    // clearing its mark strands the exporter on a slide that is sitting there
    // fully rendered. That is not hypothetical: the exporter's own order is
    // `goto` (slide 0 mounts and settles) -> `reset()` -> `waitForSettled(slide 0)`,
    // and `goTo(0)` is a no-op because it is already slide 0 — so the first
    // slide timed out every single run and `bun run pdf` never produced a
    // file. Verified 10.09.2026: settled -> reset -> TIMEOUT -> remount -> settled.
    autoSettledMounted.forEach(id => settled.add(id));
  },
};
