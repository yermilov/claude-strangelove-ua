import { ReactNode } from 'react';

/* Kubrick building blocks.
 *
 * Three compositions carry the skin, and they exist as components rather than
 * as copy-pasted markup because each of them is used by several slides and has
 * to look identical every time — that repetition is what makes the visual
 * language read as a language.
 *
 * Styles live in `src/styles/slide-layouts.css` under the matching headings.
 * Nothing here hardcodes a colour or a size. */

/** The title-card convention of "2001": one line of type in the void, held
 *  long enough to become a pause. Punctuation between acts of the talk. */
export function ActCard({
  number,
  title,
  note,
}: {
  /** Act label, e.g. "Акт I" or "Частина 2". Rendered small and red. */
  number: string;
  title: ReactNode;
  /** Optional single line under the title — a question, not a summary. */
  note?: ReactNode;
}) {
  return (
    <div className="act-card">
      <div className="act-card__number">{number}</div>
      <div className="act-card__title">{title}</div>
      {note ? <div className="act-card__note">{note}</div> : null}
    </div>
  );
}

/** Ken Adam's War Room — a ring of light over the round table. The section
 *  frame: the ring holds the heading and nothing else competes with it. */
export function LightRing({
  label,
  title,
}: {
  /** Small tracked-out label above the title, e.g. "Контроль 3". */
  label?: string;
  title: ReactNode;
}) {
  return (
    <div className="light-ring">
      <div>
        {label ? <div className="light-ring__label">{label}</div> : null}
        <div className="light-ring__title">{title}</div>
      </div>
    </div>
  );
}

export interface BigBoardPanel {
  /** Stable key and the numeral shown in the corner, e.g. "01". */
  index: string;
  label: ReactNode;
}

/** The War Room's wall of displays: a 3x2 board where exactly one panel is
 *  lit. The board never moves between slides, so the audience keeps its
 *  bearings while the talk walks through the six controls.
 *
 *  `activeIndex` matches a panel's `index`; pass none to show the board cold
 *  (useful for the slide that introduces all six at once). */
export function BigBoard({
  panels,
  activeIndex,
}: {
  panels: BigBoardPanel[];
  activeIndex?: string;
}) {
  return (
    <div className="big-board">
      {panels.map((panel) => (
        <div
          key={panel.index}
          className="big-board__panel"
          aria-current={panel.index === activeIndex ? 'true' : undefined}
        >
          <span className="big-board__index">{panel.index}</span>
          <span className="big-board__label">{panel.label}</span>
        </div>
      ))}
    </div>
  );
}

/** A panel where the machine speaks — an agent log, a transcript, a tool
 *  trace. Everything inside returns to the CRT register: mono, amber, glow.
 *  Code blocks and the input bar already do this on their own; this is for
 *  everything else. */
export function Machine({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className ? `machine ${className}` : 'machine'}>
      {children}
    </div>
  );
}
