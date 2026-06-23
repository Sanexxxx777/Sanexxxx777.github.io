# portfolio-site — shulgin.is-a.dev

Брутализм-портфолио Александра Шульгина. **Редизайн 23.06.2026: single-file HTML → Vite + React 19 + TS**, длинный скролл вместо вкладок. Премиум-брутализм (чёрный + коралл `#ee4e4e`), двуязычный RU/EN, вау-анимации.

## Деплой (ИЗМЕНИЛСЯ — больше НЕ git-push index.html)
- Репо `Sanexxxx777/Sanexxxx777.github.io` (**PUBLIC, приватным делать НЕЛЬЗЯ** — это и есть Pages-сайт).
- Сборка через **GitHub Actions** (`.github/workflows/deploy.yml`): `npm ci && npm run build` → артефакт `dist` → Pages.
- ⚠️ **Pages Source в настройках репо ДОЛЖЕН быть "GitHub Actions"**, НЕ "Deploy from branch" — иначе Actions-деплой не применится.
- `CNAME` лежит в `public/` → попадает в `dist` (домен не слетит). `cover3.png` (OG) тоже в `public/`.
- Откат: ветка `legacy-singlefile` хранит старый single-file `index.html`.

## Шрифты — ГЕТЧ
- `--f-display` = `"Big Shoulders Display", "Oswald", ...`. **Big Shoulders НЕ имеет кириллицы** (только latin/latin-ext/vietnamese) → EN-заголовки идут в Big Shoulders, **RU-заголовки в Oswald** (per-glyph fallback). НЕ убирать Oswald, иначе русские заголовки отвалятся на системный фолбэк.
- Self-host через `@fontsource` (скилл design-taste-frontend запрещает `<link>` Google Fonts). Inter/JetBrains Mono кириллицу тащат.

## Контент — линия приватности (ИНВАРИАНТ)
- Витрина: **флагман-блок «Polymarket Market-Making System»** (`src/data/flagship.ts`) объединяет 6 трейдинг-модулей в одну систему. Хвастаемся РЕЗУЛЬТАТАМИ (×13, sub-50ms, казначейство, 24/7, 3.9M).
- ⚠️ **НЕ палить МЕТОД:** EIP-712, батч-постинг, GIL, CPU-isolation, точный wire. Скрыто намеренно (репо публичный).
- Трейдинг-подсистемы НЕ дублируются как отдельные карточки (они во флагмане). `src/data/projects.ts` = остальные 12, сильное-вперёд (Lean@DeepMind первым).

## i18n
- RU = источник/дефолт. Весь текст двуязычный: статика UI в `src/i18n/dict.ts`, контент в `src/data/*` (`{ru,en}`). **Любую правку текста вносить в ОБА языка.**
- ⚠️ **Тире:** RU оставляет типографское `—` (корректно). EN — `—` ЗАПРЕЩЁН (правило design-skill), только дефис `-`.
- Переключатель `lang` в localStorage, автодетект по `navigator.language`. OG/title/desc в `<head>` статика EN (для краулеров), JS перетирает для юзеров.

## Анимации
- Всё gated `prefers-reduced-motion`. Reveal = Motion `whileInView` (контент `opacity:0` до входа в вьюпорт → **full-page скриншот выглядит пустым, это норма**; для проверки скриншотить в reduced-motion или со скроллом).
- Lenis smooth-scroll (`src/lib/useLenis.ts`, обычный rAF). Parallax ghost-«25» через Motion `useScroll`. GSAP убран (был мёртвым грузом).

## Структура
`src/components/*` (секции + Hero/Topbar/Marquee/Footer + хелперы Reveal/CountUp/Glitch/MagneticButton), `src/data/*` (контент), `src/i18n/*`, `src/lib/*` (scroll/lenis/scrollspy/bi), `src/styles/{tokens,global}.css`. CSS Modules + нативный CSS (брутализм = без UI-фреймворка).

## Run
`npm run dev` (:5173) · `npm run build` (tsc + vite) · `npm run preview`.
