import { SlideDefinition } from '../types/slides';
import { ArchitectureDiagram } from '../components/ArchitectureDiagram';

/* "А що з агентами тепер?" — the turn to agents after the second «проміжні
 * висновки»: the same diagram as «500 MR від 50 контриб'юторів», the whole
 * crowd already there, and a swarm of agents pouring in over it. */

export const AgentsSlide: SlideDefinition = {
  id: 'agents',
  title: <>а що з агентами тепер?</>,
  content: (
    <div className="first-day">
      <ArchitectureDiagram clients code wolves={['me', 'mateLeft', 'mateBelow']} crowd swarm />
    </div>
  ),
  notes: 'П’ятдесят людей — це було ще нормально. А тепер кожен з них запускає агентів, і MR-ів стає на порядок більше.',
};
