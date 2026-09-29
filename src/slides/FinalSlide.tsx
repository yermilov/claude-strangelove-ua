import { SlideDefinition } from '../types/slides';
import linkedinQr from '/linkedin-qr.jpeg?url';
import { COMPACTING_TITLE } from './compacting';
import { POINTS } from './ConclusionsSlide';

/* The last «compacting the conversation»: every conclusion of the talk at
 * once, and the LinkedIn QR beside them. */

export const FinalSlide: SlideDefinition = {
  id: 'final',
  title: COMPACTING_TITLE,
  // The closing slide is the deck's one inversion — the white room at the end
  // of "2001". It is deliberately the only place the void turns white, so the
  // switch itself reads as the talk ending.
  content: (
    <div
      className="slide-inverse"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-3xl)',
        width: '100%',
        // Fill the stage under the title band so the QR can size against it.
        flex: 1,
        minHeight: 0,
        paddingBottom: 'var(--space-xl)',
        // The QR card is a full-height right column, so it would otherwise
        // run straight into the Fwdays mark in the corner. See the token.
        paddingRight: 'var(--conference-mark-inset)',
      }}
    >
      <ul className="final__points">
        {POINTS.map((point, i) => (
          <li key={i}>{point}</li>
        ))}
      </ul>

      <img
        src={linkedinQr}
        alt="LinkedIn QR code - Yarik Yermilov"
        className="final-qr"
        style={{
          flexShrink: 0,
          maxWidth: '600px',
          // The row's height, not `100vh - 180px`: at 720p that ran the
          // QR ~190px under the flight track.
          maxHeight: '100%',
          objectFit: 'contain',
          border: '1px solid var(--kubrick-grey-3)',
        }}
      />
    </div>
  ),
  notes: 'Усі висновки разом. Питання — зараз, або в LinkedIn за QR-кодом.',
};
