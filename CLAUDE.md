# portfolio-site — shulgin.is-a.dev

Брутализм-портфолио Александра Шульгина. **Редизайн 23.06.2026: single-file HTML → Vite + React 19 + TS**, длинный скролл вместо вкладок. Премиум-брутализм (чёрный + коралл `#ee4e4e`), двуязычный RU/EN, вау-анимации.

**14.07, задеплоено 15.07:** `Topbar.tsx`+`Topbar.module.css` — внешняя ссылка «Магазин»/«Store» (`https://shulgin.is-a.dev/store`, теперь живая) добавлена ОТДЕЛЬНЫМ `<a href>` рядом с `SECTIONS.map` (десктоп-nav и мобильный sheet), НЕ внутри массива `SECTIONS` — не участвует в scrollspy. 15.07: получила выделенную coral-обводку+пульс-точку (`.store`/`.sheetStore`, тот же паттерн что у `.cta`/«Написать») — раньше сливалась с обычными scroll-anchor пунктами. Задеплоено (clone→cp→build→push→Actions), живое на shulgin.is-a.dev подтверждено Playwright.

## Машинный слой + scramble (12.07.2026, харвест borkiss)
- **`public/llms.txt` + `public/llms-full.txt`** — markdown-зеркало для ИИ-агентов (скилл `machine-readable-site`). ⚠️При смене контента сайта (`src/data/*`, метрики hero) — обновлять llms-full ВРУЧНУЮ той же правкой, автогенерации нет. Линия приватности как у сайта: результаты без методов. `index.html` head: `link rel=alternate type=text/markdown` + JSON-LD Person (только для Google, LLM его игнорируют — не расширять).
- **Text Scramble на заголовках секций** — `src/lib/scramble.ts` + `scrambleOnReveal(h2Ref)` в `SectionHead`. Один раз при первом in-view, reduced-motion не запускается. ⚠️Один текст-эффект на зону: Glitch = hero-only, scramble = секции; не совмещать на одном элементе. Рецепт → память `reference_ui_interaction_patterns`.
- **Отвергнуто осознанно** (не предлагать заново): AGENTS.md на домене, живые GitHub-звёзды (<10★), serif-заголовки а-ля borkiss (ломают брутализм), CV PDF (отложен — нужен контент от Саши).

## Пакет 12.07 №2 (kinetic/призрак/математика/SEO)
- **Kinetic hero** — `Kinetic.tsx`: вес букв H1 плывёт за курсором (variable fonts `@fontsource-variable/*`, импортить `/index.css` — голый импорт валит tsc TS2882). ⚠️Glitch УДАЛЁН (заменён Kinetic, два текст-эффекта на слове = каша). ⚠️Oswald ось wght до 700 — кириллице peak 700, не 900.
- **Призрак v3.2**: буфер 840×560 + `zoom:1.18` (опция движка) + реакции (wink на появление, surprise на резкий скролл). Подробности → память `project_ghost_engine_portfolio`.
- **Мат-блок**: водяные формулы `FormalMath.module.css` (mathLayer), ∎ после merged-тегов, lede «vetted by people at Google». Не превращать в жёлтые заявления — формулировка выверена честной.
- **SEO**: `public/robots.txt`+`sitemap.xml` (один URL; при новых страницах — дополнять). Внешние ссылки на сайт (GitHub-профиль/LinkedIn/биржи) — рычаг сильнее техники, за Сашей.
- ⚠️**ДЕПЛОЙ-ГЕТЧ: перед cp локальных файлов в клон репо — diff с репо-версией, репо бывает НОВЕЕ** (кейс 12.07: затёрла `coda_tag` → Actions red TS2339). После деплоя забирать репо-версии изменённых напрямую файлов обратно в `~/Projects/portfolio-site`.

## Деплой (ИЗМЕНИЛСЯ — больше НЕ git-push index.html)
- Репо `Sanexxxx777/Sanexxxx777.github.io` (**PUBLIC, приватным делать НЕЛЬЗЯ** — это и есть Pages-сайт).
- Сборка через **GitHub Actions** (`.github/workflows/deploy.yml`): `npm install && npm run build` → артефакт `dist` → Pages. ⚠️ `npm install` НЕ `npm ci` (рассинхрон lock на кросс-платформ нативном биндинге Vite8/rolldown `@emnapi/*` → `npm ci` падает на linux CI).
- ⚠️ **Pages Source в настройках репо ДОЛЖЕН быть "GitHub Actions"**, НЕ "Deploy from branch" — иначе Actions-деплой не применится.
- `CNAME` лежит в `public/` → попадает в `dist` (домен не слетит). `cover3.png` (OG) тоже в `public/`.
- Откат: ветка `legacy-singlefile` хранит старый single-file `index.html`.

## Шрифты — ГЕТЧ
- `--f-display` = `"Big Shoulders Display", "Oswald", ...`. **Big Shoulders НЕ имеет кириллицы** (только latin/latin-ext/vietnamese) → EN-заголовки идут в Big Shoulders, **RU-заголовки в Oswald** (per-glyph fallback). НЕ убирать Oswald, иначе русские заголовки отвалятся на системный фолбэк.
- Self-host через `@fontsource` (скилл design-taste-frontend запрещает `<link>` Google Fonts). Inter/JetBrains Mono кириллицу тащат.

## Контент — линия приватности (ИНВАРИАНТ)
- Витрина: **флагман-блок «Polymarket Market-Making System»** (`src/data/flagship.ts`) объединяет 6 трейдинг-модулей в одну систему. Хвастаемся РЕЗУЛЬТАТАМИ (×13, sub-50ms, казначейство, 24/7, 3.9M).
- ⚠️ **НЕ палить МЕТОД:** EIP-712, батч-постинг, GIL, CPU-isolation, точный wire. Скрыто намеренно (репо публичный).
- Трейдинг-подсистемы НЕ дублируются как отдельные карточки (они во флагмане). `src/data/projects.ts` = остальные проекты, сильное-вперёд (Content Factory первым).
- **Второй флагман-блок — «Формальная математика»** (`FormalMath.tsx` + `src/data/formalMath.ts`, переиспользует `FlagshipSystem.module.css`, рендерится после `<FlagshipSystem/>` в `Projects.tsx`). Сворачивает Lean@DeepMind + OpenEvolve в один блок (метрики + вклады со ссылками на merged-PR/репо). ⚠️**НЕ возвращать карточки `lean`/`openevolve` в `projects.ts`** — они намеренно свёрнуты сюда, иначе дубль. i18n-ключи `fmath_*` в оба языка.

## i18n
- RU = источник/дефолт. Весь текст двуязычный: статика UI в `src/i18n/dict.ts`, контент в `src/data/*` (`{ru,en}`). **Любую правку текста вносить в ОБА языка.**
- ⚠️ **Тире:** RU оставляет типографское `—` (корректно). EN — `—` ЗАПРЕЩЁН (правило design-skill), только дефис `-`.
- Переключатель `lang` в localStorage, автодетект по `navigator.language`. OG/title/desc в `<head>` статика EN (для краулеров), JS перетирает для юзеров.

## Анимации
- Всё gated `prefers-reduced-motion`. Reveal = Motion `whileInView` (контент `opacity:0` до входа в вьюпорт → **full-page скриншот выглядит пустым, это норма**; для проверки скриншотить в reduced-motion или со скроллом).
- Lenis smooth-scroll (`src/lib/useLenis.ts`, обычный rAF). Parallax ghost-«25» через Motion `useScroll`. GSAP убран (был мёртвым грузом).

## Гетчи UI (правки 24.06 по фидбэку)
- **Пасхалка «42»** в `Marquee.tsx` — кликабельный `button.egg` (мерцает coral, `eggPulse`) → тост `.eggHint` (`position:fixed`, т.к. `.marquee` имеет `overflow:hidden`). НЕ удалять.
- **Coral-акцент = последнее слово заголовка** автоматически: `SectionHead` сплитит title, последнее слово в `.accent` (coral). Касается ВСЕХ секций, не только Contact.
- **Watermark-цифры секций** — под линией `.top` (`top` положительный ~2.2-3.6rem, за `h2`), чтобы линия не перечёркивала цифру.
- **Network-созвездие** (фон Hero) — canvas `HeroObject.tsx`, центр проекции `cy = h*0.42` (приподнят над геометрическим центром).
- **Деплой UI-правок:** `~/Projects/portfolio-site` локально НЕ git (source); деплой = clone репо `Sanexxxx777.github.io` → cp правок → commit → push → Actions. Локальный `npm run preview` недоступен под Shadowrocket (прокси заворачивает localhost) → визуал проверять на live.
- **Полировка 24.06 (скилл make-interfaces-feel-better):** `CountUp.tsx` span получил `font-variant-numeric: tabular-nums` (метрики ×13/24/10+/3.9M не дёргаются при анимации счёта); `global.css` — `text-wrap: balance` на `h1-h4` + `pretty` на `body` (без орфанов). ⚠️**shadows-over-borders из скилла НЕ применять** — брутализм намеренно резкий, `border: 1px solid` = часть стиля, заменять на тени = сломать эстетику.

## Гетчи UI (правки 25.06)
- **Hero-сеть НЕ режется маской, НЕ размером.** Крупная node-network в правой колонке (`HeroObject.module.css` `width:min(58%,820px)`) клипалась по краю экрана. Фикс = `mask-image` затухание краёв канваса. ❌НЕ уменьшать `R`, ❌НЕ повышать `focal` (1700 = плоское неестественное вращение), ❌НЕ full-bleed (сеть лезет на текст). Размер/перспектива оригинальные: `R=Math.min(w,h)*0.42`, `focal=620`, `cx=w*0.5`.
- **Резкий coral `border-top:2px solid` → мягкий `::before` edge-fading градиент** — паттерн для выделенных блоков (`FlagshipSystem.panel`, `Releases.featured`). Hard 2px coral edge-to-edge читается как алерт — не делать.
- **Кликабельная карточка:** `Project.link?` (типы `data/types.ts`) → `ProjectCard` рендерит `<a target=_blank rel=noopener>` вместо `<article>`, стрелка `↗` показывается ТОЛЬКО при наличии `link`. Линки — на публичные репо/артефакты (Lean → merged PR). Приватные/клиентские/трейдинг — без link.
- **Стек-маркеры:** core (`pct>=85`) = coral ■, non-core = filled dim ▪ (`var(--ink-faint)`), НЕ hollow `□` (читалось «не использую»). Легенда внизу секции (`s4_leg_core/s4_leg_use`) обязательна, символы легенды = реальным маркерам (был баг ●≠■).
- **Раздел «Приложения» (§04):** `Applications.tsx` переиспользует `Projects.module.css .grid` + `ProjectCard`, данные `data/apps.ts`, нав через `Topbar SECTIONS` (scrollspy авто). ⚠️При вставке секции — перенумеровать `§NN` бэйджи в `dict.ts` для ОБОИХ языков.
- **Modern Web Guidance** скилл доступен (`~/.claude/skills/modern-web-guidance/`, вендорный пиннинг) — звать на веб-таски за актуальными браузерными API/Baseline.

## Структура
`src/components/*` (секции + Hero/Topbar/Marquee/Footer + хелперы Reveal/CountUp/Glitch/MagneticButton), `src/data/*` (контент), `src/i18n/*`, `src/lib/*` (scroll/lenis/scrollspy/bi), `src/styles/{tokens,global}.css`. CSS Modules + нативный CSS (брутализм = без UI-фреймворка).

## Run
`npm run dev` (:5173) · `npm run build` (tsc + vite) · `npm run preview`.
