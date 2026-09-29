import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';
import { COMPACTING_TITLE } from './compacting';
import { TLDR } from './TeamOfThreeSlide';

/* «compacting the conversation» after «а що з агентами тепер?»: the same two
 * conclusions as the first recap, with people swapped for agents — the swap
 * is the point, so «агентів» takes the deck's one red. One step: the first
 * point is already said (grey), the agents one is the one being made. */

export const AGENTS_POINT: ReactNode = (
  <>
    Не покладайся на дії <span className="accent-red">агентів</span> — вони їх не зроблять
  </>
);
const POINTS: ReactNode[] = [TLDR[0], AGENTS_POINT];

export const AgentsConclusionsSlide: SlideDefinition = {
  id: 'conclusions-agents',
  title: COMPACTING_TITLE,
  content: (
    <div className="first-day">
      <ul className="team__tldr">
        {POINTS.map((point, i) => (
          <li key={i} className={i < POINTS.length - 1 ? 'team__tldr--said' : undefined}>
            {point}
          </li>
        ))}
      </ul>
    </div>
  ),
  notes: 'Те саме, що з людьми: вибір непродуктивний — зафіксуйте одну непогану опцію. І не покладайся на дії агентів — вони їх теж не зроблять.',
};
