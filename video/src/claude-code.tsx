import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { loadFont } from '@remotion/google-fonts/JetBrainsMono';

/* The Claude Code terminal, drawn frame by frame: the palette, the ⏺ tool
 * calls, the ⎿ results, the permission-prompt markers, the keycaps. Shared by
 * every session replay so they all look like the same CLI. */

export const { fontFamily } = loadFont('normal', { weights: ['400', '700'], subsets: ['latin', 'cyrillic'] });

export const C = {
  bg: '#0a0e14',
  chrome: '#161b22',
  text: '#e6e6e6',
  dim: '#8b8b8b',
  claude: '#d77757',
  ok: '#4eba65',
  err: '#ff6b80',
  permission: '#b1b9f9',
  addBg: '#1d4428',
  delBg: '#5c2330',
  userBg: '#262626',
  mark: '#e63946', // the deck's one red — the annotation, not Claude Code's UI
};

export const FONT = 30;
export const LINE = 1.42;

// ---------- primitives ----------
export const Dot: React.FC<{ color: string; blink?: boolean }> = ({ color, blink }) => {
  const frame = useCurrentFrame();
  const on = !blink || Math.floor(frame / 12) % 2 === 0;
  return (
    <span
      style={{
        display: 'inline-block',
        width: FONT * 0.42,
        height: FONT * 0.42,
        borderRadius: '50%',
        background: on ? color : 'transparent',
        border: `2px solid ${color}`,
        marginRight: FONT * 0.6,
        verticalAlign: 'middle',
        position: 'relative',
        top: -2,
      }}
    />
  );
};

// The ⎿ elbow Claude Code hangs every tool result from.
export const Elbow: React.FC = () => (
  <span
    style={{
      display: 'inline-block',
      width: FONT * 0.5,
      height: FONT * 0.55,
      borderLeft: `2px solid ${C.dim}`,
      borderBottom: `2px solid ${C.dim}`,
      marginLeft: FONT * 0.6,
      marginRight: FONT * 0.9,
      position: 'relative',
      top: -FONT * 0.28,
    }}
  />
);

export const Row: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ whiteSpace: 'pre-wrap', ...style }}>{children}</div>
);

export const Tool: React.FC<{ name: string; arg: string; dot: string; blink?: boolean }> = ({ name, arg, dot, blink }) => (
  <Row>
    <Dot color={dot} blink={blink} />
    <b>{name}</b>({arg})
  </Row>
);

// Result lines: the first carries the elbow, the rest are indented under it.
export const Result: React.FC<{ lines: React.ReactNode[]; color?: string }> = ({ lines, color = C.dim }) => (
  <div style={{ color }}>
    {lines.map((l, i) => (
      <Row key={i} style={{ paddingLeft: i === 0 ? 0 : FONT * 2.6 }}>
        {i === 0 && <Elbow />}
        {l}
      </Row>
    ))}
  </div>
);

export const Block: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ marginTop: FONT * 0.7 }}>{children}</div>
);

// A red marker drawn under a phrase — the talk's annotation of what the human noticed.
// text-decoration rather than a positioned bar, so it follows the phrase across a wrap.
export const Marked: React.FC<{ from: number; children: React.ReactNode }> = ({ from, children }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [from, from + 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <span
      style={{
        textDecorationLine: 'underline',
        textDecorationThickness: 4,
        textUnderlineOffset: 8,
        textDecorationColor: `rgba(230, 57, 70, ${p})`,
        textDecorationSkipInk: 'none',
      }}
    >
      {children}
    </span>
  );
};

export const Spinner: React.FC<{ label: string }> = ({ label }) => {
  const frame = useCurrentFrame();
  const glyphs = ['·', '✢', '✳', '✶', '✻', '✽'];
  const g = glyphs[Math.floor(frame / 4) % glyphs.length];
  return (
    <Row style={{ color: C.claude }}>
      {g} {label}… <span style={{ color: C.dim }}>(esc to interrupt)</span>
    </Row>
  );
};

export const KeyCap: React.FC<{ at: number; label: string }> = ({ at, label }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < at || frame > at + 40) return null;
  const s = spring({ frame: frame - at, fps, config: { damping: 12 } });
  const fade = interpolate(frame, [at + 28, at + 40], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        position: 'absolute',
        right: 60,
        top: 90,
        padding: '14px 28px',
        border: `3px solid ${C.text}`,
        borderRadius: 14,
        color: C.text,
        fontSize: 40,
        fontWeight: 700,
        background: '#1c2128',
        boxShadow: '0 6px 0 #000',
        transform: `scale(${0.6 + 0.4 * s})`,
        opacity: fade,
      }}
    >
      {label}
    </div>
  );
};


// The user types their prompt 20% faster than first staged (Yarik, 02.10.2026).
// A timeline is written at the old pace; `quickenTyping` shortens its
// typeStart→typeEnd window by this factor and moves every later event up by
// what was saved, so nothing waits after the prompt is typed.
export const TYPING_SPEEDUP = 1.2;

/** frames saved by typing faster, for a timeline's duration and still frame */
export const typingSaved = (t: { typeStart: number; typeEnd: number }, speedup = TYPING_SPEEDUP) =>
  t.typeEnd - t.typeStart - Math.round((t.typeEnd - t.typeStart) / speedup);

export const quickenTyping = <T extends { typeStart: number; typeEnd: number }>(t: T, speedup = TYPING_SPEEDUP): T => {
  const saved = typingSaved(t, speedup);
  return Object.fromEntries(
    Object.entries(t).map(([k, v]) => [k, typeof v === 'number' && v >= t.typeEnd ? v - saved : v]),
  ) as T;
};
