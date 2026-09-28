import { SlideDefinition } from '../types/slides';

export interface Step {
  /** index into the slides array */
  index: number;
  revealStage: number;
}

/**
 * The talk as one line: every (slide, reveal) pair in the order the talk
 * visits it, detours inlined. A detour target sits after its origin in the
 * array but is shown in the MIDDLE of the origin's reveals: at `atStage` the
 * target plays in full, then the origin resumes at `returnStage`; the target
 * is not visited again on the linear pass.
 *
 * Navigation is a position on this line — forward is +1, back is −1, and the
 * URL's `#slide-N` is position N — so ids rise monotonically through detours
 * and back always retraces forward.
 */
export function deckPath(slides: SlideDefinition[]): Step[] {
  const detourTargets = new Set(slides.flatMap((s) => (s.detours ?? []).map((d) => d.toId)));
  const steps: Step[] = [];
  const seen = new Set<string>();
  const visit = (index: number, revealStage: number) => {
    const key = `${index}:${revealStage}`;
    if (seen.has(key)) return;
    seen.add(key);
    steps.push({ index, revealStage });
  };

  slides.forEach((slide, index) => {
    if (detourTargets.has(slide.id)) return;
    const max = slide.maxRevealStages ?? 0;
    for (let stage = 0; stage <= max; stage++) {
      visit(index, stage);
      const detour = slide.detours?.find((d) => d.atStage === stage);
      if (!detour) continue;
      const target = slides.findIndex((s) => s.id === detour.toId);
      if (target < 0) continue;
      for (let t = 0; t <= (slides[target].maxRevealStages ?? 0); t++) visit(target, t);
      stage = detour.returnStage - 1; // the loop's ++ lands on returnStage
    }
  });

  return steps;
}
