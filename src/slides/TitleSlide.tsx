import { SlideDefinition } from '../types/slides';

export const TitleSlide: SlideDefinition = {
  id: 'title',
  content: (
    <div className="title-slide">
      <h1 className="hero title-glow">Клод Стрейнджлав</h1>
      <p className="title-tagline">або як я перестав хвилюватися і читати код, згенерований AI</p>
      <p className="title-subtitle">Ярослав Єрмілов, Principal Software Engineer @ Superhuman (formerly Grammarly)</p>
    </div>
  ),
  notes: "Fwdays Tech Summit'26, Київ, 3 жовтня 2026. Таймер стартує, щойно зійдеш з цього слайда.",
};
