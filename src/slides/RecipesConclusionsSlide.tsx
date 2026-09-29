import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';
import { COMPACTING_TITLE } from './compacting';
import { TLDR } from './TeamOfThreeSlide';
import { AGENTS_POINT } from './AgentsConclusionsSlide';
import { BeyoncePicture, POINTS as ALL_EARLIER } from './ConclusionsSlide';

/* «compacting the conversation» after the recipes: the agents recap's two
 * points, said (grey), and the CI-gate line brought back as the point being
 * made — for agents it holds just as it did for people — with Beyoncé beside
 * it again. One step. */

const CI_GATE_POINT = ALL_EARLIER[TLDR.length];
const POINTS: ReactNode[] = [TLDR[0], AGENTS_POINT, CI_GATE_POINT];

export const RecipesConclusionsSlide: SlideDefinition = {
  id: 'conclusions-recipes',
  title: COMPACTING_TITLE,
  content: (
    <div className="first-day">
      <div className="conclusions">
        <ul className="team__tldr">
          {POINTS.map((point, i) => (
            <li key={i} className={i < POINTS.length - 1 ? 'team__tldr--said' : undefined}>
              {point}
            </li>
          ))}
        </ul>
        <BeyoncePicture />
      </div>
    </div>
  ),
  notes: 'Для агентів працює те саме: if you liked it, then you shoulda put a CI gate on it.',
};
