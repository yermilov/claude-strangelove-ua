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
}) {
  // `mark` is a red frame over the part of the screenshot the talk is about,
  // in fractions of the image. `spinner` puts the Grammarly button back where
  // it sat in the compose box, spinning as it does while it checks — the
  // original slide was a GIF, and the PDF kept only a frame without it.
  // x/y are its centre and size its width, all in fractions of the image.
  return (
    <figure className={`shot${hidden ? ' shot--hidden' : ''}`}>
      <div className="shot__frame" style={{ ['--ratio' as string]: ratio }}>
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

