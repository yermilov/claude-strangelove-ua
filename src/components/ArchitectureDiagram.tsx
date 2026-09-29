import kapitoshkaImg from '../assets/first-day-kapitoshka.png';
import wolfImg from '../assets/first-day-wolf.png';
import roboWolfImg from '../assets/agents-robo-wolf.png';

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

// The rest of the 50 contributors, all over the diagram as in the original
// «500 MR from 50 contributors» slide — on every box, not only beside the
// code. Kept inside the viewBox; about half face the other way.
const CROWD_W = 175;
const CROWD: Spot[] = (
  [
    [1000, 80],
    [560, 175, true],
    [870, 190],
    [1360, 70, true],
    [1640, 60],
    [1150, 170],
    [430, 330, true],
    [780, 310, true],
    [1300, 280],
    [600, 470],
    [930, 440],
    [1190, 520, true],
    [1450, 500],
    [380, 560, true],
  ] as [number, number, boolean?][]
).map(([x, y, flip]) => ({ x, y, flip, w: CROWD_W, src: wolfImg, alt: 'Вовк — контриб’ютор' }));

// «а що з агентами тепер?»: the contributors' crowd and then a swarm on top,
// smaller and denser — a jittered grid over the whole diagram so no box is
// left clear. The agents are robo-wolves (steel, one HAL-red eye), so they
// read apart from the human crowd they pour in over. A fixed seed keeps the scatter the same on every render.
const SWARM_W = 140;
const SWARM: Spot[] = (() => {
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const cols = 9;
  const rows = 5;
  const [x0, x1, y0, y1] = [410, 1950, 80, 610];
  const spots: Spot[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      spots.push({
        x: x0 + ((c + 0.5) / cols) * (x1 - x0) + (rand() - 0.5) * 90,
        y: y0 + ((r + 0.5) / rows) * (y1 - y0) + (rand() - 0.5) * 70,
        w: SWARM_W,
        flip: rand() < 0.5,
        src: roboWolfImg,
        alt: 'Робововк — агент',
      });
    }
  }
  // arrive in a shuffled order rather than row by row
  return spots.sort(() => rand() - 0.5);
})();

function Character({ spot, delayMs }: { spot: Spot; delayMs?: number }) {
  const s = spot;
  const image = (
    <image
      className="arch__character"
      style={delayMs ? { animationDelay: `${delayMs}ms` } : undefined}
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
  /** the whole crowd of contributors over the diagram, arriving one by one */
  crowd?: boolean;
  /** a denser swarm on top of the crowd — the agents */
  swarm?: boolean;
}

/** The 2017 Grammarly architecture from the Berlin 2023 talk, redrawn as one
 * scaling SVG — its labels scale with it, like the text in an image. Layers
 * are switched on by props so a slide can build it up reveal by reveal. */
export function ArchitectureDiagram({ clients, code, wolves = [], crowd, swarm }: ArchitectureDiagramProps) {
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
      {crowd && CROWD.map((s, i) => <Character key={i} spot={s} delayMs={swarm ? 0 : 300 + i * 120} />)}
      {swarm && SWARM.map((s, i) => <Character key={`s${i}`} spot={s} delayMs={300 + i * 45} />)}
      {wolves.map((w) => (
        <Character key={w} spot={CHARACTER_SPOTS[w]} />
      ))}
      {code && <Character spot={CHARACTER_SPOTS.code} />}
    </svg>
  );
}

