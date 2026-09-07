import { ReactNode } from 'react';
import { SlideDefinition } from '../types/slides';
import { SlideItem, Emphasis } from '../components/SlideElements';
import linkedinQr from '/linkedin-qr.jpeg?url';

// TODO: замінити на фінальні висновки доповіді — по одному рядку на думку,
// яку ти реально скажеш вголос. Порядок = порядок шести контролів.
const BULLETS: ReactNode[] = [
  <>
    лід не масштабується рев'ю — лід масштабується{' '}
    <Emphasis color="green">процесом</Emphasis>
  </>,
  <>
    питання? питай зараз, або пиши в LinkedIn{' '}
    <span style={{ color: 'var(--terminal-blue)' }}>→</span>
  </>,
];

export const FinalSlide: SlideDefinition = {
  id: 'final',
  title: (
    <>
      <span className="text-dim">&gt;</span> compacting the conversation...
    </>
  ),
  maxRevealStages: BULLETS.length,
  content: ({ revealStage }) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-3xl)',
        width: '100%',
        paddingBottom: 'var(--space-xl)',
      }}
    >
      {/* Left column - bullets */}
      <div style={{ flex: 1, maxWidth: '650px', textAlign: 'left' }}>
        {(() => {
          // rolling window: overflow slide
          const WINDOW = 3;
          const firstVisible = Math.max(0, revealStage - WINDOW);
          return BULLETS.map((bullet, i) =>
            revealStage >= i + 1 && i >= firstVisible ? (
              <SlideItem key={i} delay={0}>
                {bullet}
              </SlideItem>
            ) : null,
          );
        })()}
      </div>

      {/* Right column - QR code, revealed only on the final stage */}
      {revealStage >= BULLETS.length && (
        <img
          src={linkedinQr}
          alt="LinkedIn QR code - Yarik Yermilov"
          style={{
            flexShrink: 0,
            maxWidth: '600px',
            maxHeight: 'calc(100vh - 180px)',
            objectFit: 'contain',
            borderRadius: 'var(--input-border-radius)',
            border: '2px solid var(--terminal-border)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            opacity: 0,
            animation: 'slideItemFadeIn 0.5s ease-out forwards',
          }}
        />
      )}
    </div>
  ),
  notes: 'Фінальний слайд — заглушка. Висновки пишемо після того, як стане шість контролів.',
};
