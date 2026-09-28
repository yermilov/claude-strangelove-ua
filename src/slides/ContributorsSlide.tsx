import { SlideDefinition } from '../types/slides';
import { ArchitectureDiagram } from '../components/ArchitectureDiagram';

/* "500 MR від 50 контриб'юторів" — straight after «Хто я», rebuilt from the
 * Berlin 2023 CI-gates talk's «500 MR from 50 contributors»: the same
 * diagram as «команда з трьох», the three wolves still by the code, and the
 * rest of the contributors pouring in over every box. */

export const ContributorsSlide: SlideDefinition = {
  id: 'contributors',
  title: <>500 MR від 50 контриб'юторів</>,
  content: (
    <div className="first-day">
      <ArchitectureDiagram clients code wolves={['me', 'mateLeft', 'mateBelow']} crowd />
    </div>
  ),
  notes:
    "Команда з трьох — це було легко. Тепер 500 MR на місяць від 50 контриб'юторів з різних команд, і кожен має власні звички.",
};
