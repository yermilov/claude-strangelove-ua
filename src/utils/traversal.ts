import { SlideDefinition } from '../types/slides';

/**
 * The order in which forward navigation actually visits every (slide, reveal)
 * pair, detours included — so progress can follow the talk rather than the
 * slide array. A detour target sits after its origin in the array but is
 * shown in the MIDDLE of the origin's reveals; measuring progress by array
 * index would rewind the flight track every time a detour returns.
 *
 * Mirrors `revealNext` in useSlideNavigation: at `atStage` the detour target
 * plays in full, then the origin resumes at `returnStage`; detour targets are
 * skipped on the linear pass. Returns a map from `${slideIndex}:${stage}` to
 * its position, and the total step count.
 */
export function traversalOrder(slides: SlideDefinition[]): { position: Map<string, number>; total: number } {
  const detourTargets = new Set(slides.flatMap((s) => (s.detours ?? []).map((d) => d.toId)));
  const position = new Map<string, number>();
  let step = 0;
  const visit = (index: number, stage: number) => {
    const key = `${index}:${stage}`;
    if (!position.has(key)) position.set(key, step++);
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

  return { position, total: step };
}
