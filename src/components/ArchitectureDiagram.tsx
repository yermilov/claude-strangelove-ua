import kapitoshkaImg from '../assets/first-day-kapitoshka.png';
import wolfImg from '../assets/first-day-wolf.png';

// The diagram's own coordinate system. Columns: auth / document editor /
// processing, right of the zone labels.
const W = 1700;
const H = 800;
const COL = {
  auth: { x: 360, w: 320 },
  editor: { x: 710, w: 440 },
  processing: { x: 1180, w: 520 },
};
const ROW_H = 70;
const Y = {
  models: 40,
  authService: 150,
  services: 250,
  publicLine: 360,
  apis: 390,
  lb: 540,
  internetLine: 660,
  clients: 685,
};

function Box({ x, y, w, h = ROW_H, label, strong }: { x: number; y: number; w: number; h?: number; label: string; strong?: boolean }) {
  return (
    <g className={`arch__box${strong ? ' arch__box--strong' : ''}`}>
      <rect x={x} y={y} width={w} height={h} />
      <text x={x + w / 2} y={y + h / 2}>
        {label}
      </text>
    </g>
  );
}

function Arrow({ x, from, to }: { x: number; from: number; to: number }) {
  // Vertical connector with a head at `to`.
  const dir = to < from ? -1 : 1;
  return (
    <g className="arch__arrow">
      <line x1={x} y1={from} x2={x} y2={to - dir * 10} />
      <path d={`M ${x - 8} ${to - dir * 14} L ${x} ${to} L ${x + 8} ${to - dir * 14} Z`} />
    </g>
  );
}

function Zone({ y, label }: { y: number; label: string }) {
  return (
    <g className="arch__zone">
      <line x1={0} y1={y} x2={W} y2={y} />
      <text x={0} y={y - 14}>
        {label}
      </text>
    </g>
  );
}

// Line-art client devices for the "client apps" band: phones and laptops.
function Devices() {
  const y = Y.clients + 20;
  const items: JSX.Element[] = [];
  let x = COL.auth.x + 40;
  const kinds = ['laptop', 'phone', 'laptop', 'tablet', 'phone', 'laptop', 'phone', 'laptop', 'tablet'];
  kinds.forEach((kind, i) => {
    if (kind === 'phone') {
      items.push(<rect key={i} x={x} y={y} width={40} height={72} rx={8} />);
      x += 40 + 60;
    } else if (kind === 'tablet') {
      items.push(<rect key={i} x={x} y={y} width={62} height={80} rx={8} />);
      x += 62 + 60;
    } else {
      items.push(
        <g key={i}>
          <rect x={x + 8} y={y + 6} width={104} height={62} rx={4} />
          <path d={`M ${x} ${y + 76} L ${x + 120} ${y + 76}`} />
        </g>,
      );
      x += 120 + 60;
    }
  });
  return <g className="arch__devices">{items}</g>;
}

// Where each character stands, in diagram coordinates (the centre of the
// figure) and how wide it is drawn. Капітошка and Вовк are the original
// cutouts from the 2023 deck, in colour: readability first.
//   Капітошка is the CODE — it straddles the network line, covering both
//   Processing Service and Processing API, because it is both.
//   Вовк is ME — standing beside the code, not inside the diagram; the two
//   more wolves are the rest of the team of three. As in the original 2023
//   slide, the three surround the code — upper left (mirrored, so it faces
//   in), upper right, lower right — and the code sits in front of them.
type Spot = { x: number; y: number; w: number; src: string; alt: string; flip?: boolean };

const CODE = { x: COL.processing.x + COL.processing.w - 10, y: Y.publicLine };
const WOLF_W = 210;

const CHARACTER_SPOTS: Record<'code' | 'me' | 'mateLeft' | 'mateBelow', Spot> = {
  code: { ...CODE, w: 200, src: kapitoshkaImg, alt: 'Капітошка — код' },
  me: { x: CODE.x + 170, y: CODE.y - 110, w: WOLF_W, src: wolfImg, alt: 'Вовк — я' },
  mateLeft: { x: CODE.x - 170, y: CODE.y - 110, w: WOLF_W, src: wolfImg, alt: 'Вовк — колега', flip: true },
  mateBelow: { x: CODE.x + 170, y: CODE.y + 120, w: WOLF_W, src: wolfImg, alt: 'Вовк — колега' },
};

export type Wolf = Exclude<keyof typeof CHARACTER_SPOTS, 'code'>;

function Character({ spot }: { spot: keyof typeof CHARACTER_SPOTS }) {
  const s = CHARACTER_SPOTS[spot];
  const image = (
    <image
      className="arch__character"
      href={s.src}
      x={s.x - s.w / 2}
      y={s.y - s.w / 2}
      width={s.w}
      height={s.w}
      preserveAspectRatio="xMidYMid meet"
    >
      <title>{s.alt}</title>
    </image>
  );
  // Mirror on a wrapping <g>: the fade-in keyframes set `transform` on the
  // image itself and would override a flip placed there.
  return s.flip ? <g transform={`translate(${2 * s.x} 0) scale(-1 1)`}>{image}</g> : image;
}

export interface ArchitectureDiagramProps {
  /** line-art devices in the Client Apps band instead of its label */
  clients?: boolean;
  /** Капітошка on the processing column, with the websocket under it */
  code?: boolean;
  /** which wolves stand beside the code */
  wolves?: Wolf[];
}

/** The 2017 Grammarly architecture from the Berlin 2023 talk, redrawn as one
 * scaling SVG — its labels scale with it, like the text in an image. Layers
 * are switched on by props so a slide can build it up reveal by reveal. */
export function ArchitectureDiagram({ clients, code, wolves = [] }: ArchitectureDiagramProps) {
  const p = COL.processing;
  return (
    <svg className="arch__diagram" viewBox={`0 0 ${W + 330} ${H}`} role="img" aria-label="Архітектура Grammarly, 2017">
      <Zone y={10} label="private network" />
      <Zone y={Y.publicLine} label="public network" />
      <Zone y={Y.internetLine} label="internet" />

      <Box x={p.x} y={Y.models} w={p.w} label="Specialized Processing Services" />
      <Box x={COL.auth.x} y={Y.authService} w={COL.editor.x + COL.editor.w - COL.auth.x} label="Authentication Service" />
      <Box x={COL.editor.x} y={Y.services} w={COL.editor.w} label="Document Editor Service" />
      <Box x={p.x} y={Y.services} w={p.w} label="Processing Service" strong />

      <Box x={COL.auth.x} y={Y.apis} w={COL.auth.w} label="Auth API" />
      <Box x={COL.editor.x} y={Y.apis} w={COL.editor.w} label="Document Editor API" />
      <Box x={p.x} y={Y.apis} w={p.w} label="Processing API" strong />
      <Box x={COL.auth.x} y={Y.lb} w={W - COL.auth.x} label="Load Balancer and Web Application Firewall" />
      <Box x={COL.auth.x} y={Y.clients} w={W - COL.auth.x} h={110} label={clients ? '' : 'Client Apps'} />

      <Arrow x={COL.auth.x + COL.auth.w / 2} from={Y.apis} to={Y.authService + ROW_H} />
      <Arrow x={COL.editor.x + COL.editor.w / 2} from={Y.apis} to={Y.services + ROW_H} />
      <Arrow x={p.x + p.w / 2} from={Y.apis} to={Y.services + ROW_H} />
      <Arrow x={p.x + p.w / 2} from={Y.services} to={Y.models + ROW_H} />
      <Arrow x={COL.editor.x + COL.editor.w / 2} from={Y.services} to={Y.authService + ROW_H} />
      <Arrow x={COL.editor.x + COL.editor.w / 2 + 180} from={Y.clients} to={Y.lb + ROW_H} />

      {clients && <Devices />}
      {code && (
        // The websocket from DevTools, back on the diagram — the machine
        // talking, so it keeps the machine's register.
        <g className="machine arch__wss">
          <text x={p.x + p.w / 2} y={(Y.apis + ROW_H + Y.lb) / 2}>
            wss://capi.grammarly.com/freews
          </text>
        </g>
      )}
      {wolves.map((w) => (
        <Character key={w} spot={w} />
      ))}
      {code && <Character spot="code" />}
    </svg>
  );
}

