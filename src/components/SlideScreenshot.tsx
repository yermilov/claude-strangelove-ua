import grammarlyG from '../assets/first-day-grammarly-g.png';

/** A screenshot on a slide, framed to hug the image, with optional red marks
 * in fractions of the image. */
export function SlideScreenshot({
  src,
  alt,
  ratio,
  mark,
  spinner,
  marked = true,
  hidden,
  zoom,
  zoomScale = 2.4,
}: {
  src: string;
  alt: string;
  /** width / height of the image, so the frame hugs it exactly */
  ratio: number;
  mark?: { x: number; y: number; w: number; h: number };
  spinner?: { x: number; y: number; size: number };
  /** whether the red marks (frame, ring) are shown yet */
  marked?: boolean;
  /** laid out but not shown — keeps its place for a later reveal */
  hidden?: boolean;
  /** slowly push in on `mark` once `marked` is true, so a small detail
   * (the request URL, say) reads at back-row size without a second image */
  zoom?: boolean;
  zoomScale?: number;
}) {
  // `mark` is a red frame over the part of the screenshot the talk is about,
  // in fractions of the image. `spinner` puts the Grammarly button back where
  // it sat in the compose box, spinning as it does while it checks — the
  // original slide was a GIF, and the PDF kept only a frame without it.
  // x/y are its centre and size its width, all in fractions of the image.
  // `zoom` pushes in on `mark`'s centre instead: the frame clips (`overflow:
  // hidden`) so the image and its mark scale together as one unit and the
  // marked line ends up large in frame, the way a camera would do it rather
  // than a second cropped screenshot. The push-in is a plain CSS `transition`
  // on `transform`, driven straight off `marked` — not a `@keyframes` class
  // toggled on mount — so every flip of `marked` is a genuine style-value
  // change the browser always animates, forward or back, however many times.
  const zoomOrigin = zoom && mark ? { x: mark.x + mark.w / 2, y: mark.y + mark.h / 2 } : undefined;

  return (
    <figure className={`shot${hidden ? ' shot--hidden' : ''}`}>
      <div className="shot__frame" style={{ ['--ratio' as string]: ratio }}>
        <div
          className="shot__zoom"
          style={
            zoom
              ? {
                  transform: `scale(${marked ? zoomScale : 1})`,
                  transformOrigin: zoomOrigin ? `${zoomOrigin.x * 100}% ${zoomOrigin.y * 100}%` : undefined,
                  transitionDuration: marked ? '8s' : '0s',
                  transitionDelay: marked ? '500ms' : '0s',
                }
              : undefined
          }
        >
          <img src={src} alt={alt} loading="lazy" />
          {mark && marked && (
            <span
              className="shot__mark"
              style={{
                left: `${mark.x * 100}%`,
                top: `${mark.y * 100}%`,
                width: `${mark.w * 100}%`,
                height: `${mark.h * 100}%`,
              }}
            />
          )}
        </div>
        {spinner && (
          <span
            className={`shot__spinner${marked ? ' shot__spinner--marked' : ''}`}
            style={{ left: `${spinner.x * 100}%`, top: `${spinner.y * 100}%`, width: `${spinner.size * 100}%` }}
          >
            <img src={grammarlyG} alt="Grammarly" />
          </span>
        )}
      </div>
    </figure>
  );
}

