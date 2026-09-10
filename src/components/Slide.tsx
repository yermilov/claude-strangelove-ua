import { ReactNode, useEffect } from 'react';
import { exportRegistry } from './exportRegistry';

interface SlideProps {
  children: ReactNode;
  isActive?: boolean;
  notes?: string;
  background?: string;
  /** Threaded so non-async slides can auto-settle via exportRegistry. */
  slideId?: string;
  asyncSettle?: boolean;
  /** Optional title rendered as a fixed top-left band above the slide body. */
  title?: ReactNode;
  /** Stretch the slide to the full stage height (see SlideDefinition). */
  fullBleed?: boolean;
}

export function Slide({
  children,
  isActive = true,
  background,
  slideId,
  asyncSettle,
  title,
  fullBleed,
}: SlideProps) {
  // Auto-settle on mount for slides that don't do their own async work.
  // Slides with `asyncSettle: true` opt out and call markSlideSettled themselves.
  //
  // The retain/release pair tells the registry this slide is on screen and
  // settles by merely being mounted, so a `reset()` mid-export can put the
  // mark back instead of waiting for an effect that will never re-run.
  useEffect(() => {
    if (!isActive || asyncSettle || !slideId) return;
    exportRegistry.markSlideSettled(slideId);
    exportRegistry.retainMounted(slideId);
    return () => exportRegistry.releaseMounted(slideId);
  }, [isActive, asyncSettle, slideId]);

  if (!isActive) return null;

  return (
    <div
      className={
        [ 'slide', title && 'slide--titled', fullBleed && 'slide--fill' ]
          .filter(Boolean)
          .join(' ')
      }
      style={background ? { background } : undefined}
    >
      {title && <h2 className="slide-title">{title}</h2>}
      {children}
    </div>
  );
}
