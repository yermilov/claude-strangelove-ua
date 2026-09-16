import { SlideDefinition } from '../types/slides';

export const TitleSlide: SlideDefinition = {
  id: 'title',
  hideConferenceMark: true,
  content: (
    <div className="title-slide">
      <h1 className="hero">Клод Стрейнджлав</h1>
      <p className="title-tagline">
        або як я перестав хвилюватися і читати код, згенерований AI
      </p>
      <p className="title-subtitle">
        <span className="credit-part">Ярослав Єрмілов</span>
        <span className="credit-sep"> · </span>
        <span className="credit-part">
          Principal Software Engineer, <span className="nowrap">ex-Grammarly</span>
        </span>
      </p>
    </div>
  ),
  notes:
    "Fwdays Tech Summit'26, Київ, 3 жовтня 2026. Слот 35 хвилин. Таймер стартує, щойно зійдеш з цього слайда.",
};
