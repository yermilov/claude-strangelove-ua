import { SlideDefinition } from '../types/slides';
import gmailShot from '../assets/first-day-gmail.png';
import devtoolsShot from '../assets/first-day-devtools.png';
import { ArchitectureDiagram } from '../components/ArchitectureDiagram';
import { SlideScreenshot } from '../components/SlideScreenshot';

/* "Мій перший день" — a detour out of «Хто я» (see BioSlide `detours`),
 * rebuilt from the "My first day" group of the Berlin 2023 CI-gates talk
 * (yaroslavyermilov.io/talks/ci-gates-grammarly-berlin-2023, pp. 6–15).
 *
 * One slide, one scene per reveal:
 *   0–1    how a new engineer finds out what the product is: Gmail, then
 *          DevTools beside it (the websocket)
 *   2–6    the architecture, built up: bare → client apps → the code
 *          (Капітошка) → me (Вовк) → the models behind it (HAL)
 *
 * The diagram is redrawn in the Kubrick register rather than pasted: an
 * inline SVG that scales as one picture, so its labels scale with it like the
 * text inside an image does. Readability beats the aesthetic here (Yarik,
 * 26.09.2026): labels are white, lines light grey, the screenshots and the
 * characters keep their own colours. */

type Scene = 'screens' | 'diagram';

const SCENES: Scene[] = [
  'screens', // 0: Gmail, the Grammarly button spinning
  'screens', // 1: + DevTools on the right, and both red marks at once
  'diagram', // 2: the architecture, bare
  'diagram', // 3: + client apps
  'diagram', // 4: + the code (Капітошка)
  'diagram', // 5: + me (Вовк)
  'diagram', // 6: + the models (HAL)
];

// The reveal that brings DevTools and the red marks.
const DEVTOOLS_AT = 1;
// The first reveal that shows each layer of the diagram.
const CLIENTS_AT = 3;
const CODE_AT = 4;
const ME_AT = 5;
const MODELS_AT = 6;

export const FirstDaySlide: SlideDefinition = {
  id: 'first-day',
  title: <>мій перший день</>,
  maxRevealStages: SCENES.length - 1,
  content: ({ revealStage }) => {
    const scene = SCENES[Math.min(revealStage, SCENES.length - 1)];
    return (
      <div className="first-day" key={scene}>
        {scene === 'screens' && (
          // Side by side, each in its final place from the start: Gmail does
          // not move when DevTools arrives. The red marks — the ring round the
          // Grammarly button and the frame on the websocket — land together
          // with DevTools, because together they are the point.
          <div className="shot-pair">
            <SlideScreenshot
              src={gmailShot}
              alt="Gmail: новий лист"
              ratio={1218 / 1254}
              spinner={{ x: 0.93, y: 0.79, size: 0.06 }}
              marked={revealStage >= DEVTOOLS_AT}
            />
            <SlideScreenshot
              src={devtoolsShot}
              alt="DevTools: wss://capi.grammarly.com/freews"
              ratio={1544 / 1402}
              mark={{ x: 0.32, y: 0.09, w: 0.4, h: 0.04 }}
              hidden={revealStage < DEVTOOLS_AT}
            />
          </div>
        )}
        {scene === 'diagram' && (
          <ArchitectureDiagram
            clients={revealStage >= CLIENTS_AT}
            code={revealStage >= CODE_AT}
            wolves={revealStage >= ME_AT ? ['me'] : []}
            hal={revealStage >= MODELS_AT}
          />
        )}
      </div>
    );
  },
  notes:
    "Перший день у Grammarly (2017). Відкриваю Gmail — крутиться кнопка Grammarly; поруч DevTools — вебсокет на capi.grammarly.com/freews. Ось де він живе — архітектура, мене беруть у Processing Service / Processing API: клієнти → LB/WAF → API → сервіси → спеціалізовані processing-сервіси. Капітошка — це код (і Service, і API), Вовк — це я поруч; HAL — моделі за Specialized Processing Services.",
};
