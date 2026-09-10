import type { Release } from "./types";

export const releases: Release[] = [
  {
    ver: "v2026.09",
    when: { ru: "сентябрь 2026", en: "September 2026" },
    title: { ru: "Qwerty Switcher 0.11.0: бесплатно, код открыт", en: "Qwerty Switcher 0.11.0: free, source open" },
    body: {
      ru: "Нативный переключатель раскладки для macOS вышел бесплатным и без подписки, исходный код открыт, обновления подписаны и включаются по желанию. 872 автоматических проверки ядра.",
      en: "The native macOS layout switcher went free with no subscription, the source is open, updates are signed and opt-in. 872 automated core checks.",
    },
    kind: "prod",
  },
  {
    ver: "v2026.09",
    when: { ru: "сентябрь 2026", en: "September 2026" },
    title: { ru: "Лаборатория, доказательства и бесплатная проверка сайта", en: "Lab, evidence page and a free site check" },
    body: {
      ru: "Три страницы за неделю: /lab/ с тринадцатью живыми механиками, /proof/ только с проверяемыми ссылками и /check/ с экспресс-проверкой сайта по 152-ФЗ в изолированном воркере Cloudflare.",
      en: "Three pages in a week: /lab/ with thirteen live mechanics, /proof/ with verifiable links only, and /check/ with an express site check against 152-FZ in an isolated Cloudflare Worker.",
    },
    kind: "prod",
  },
  {
    ver: "v2026.08",
    when: { ru: "август 2026", en: "August 2026" },
    title: { ru: "Третья формализация принята в DeepMind", en: "Third formalization accepted into DeepMind" },
    body: {
      ru: "Открытая задача Грина 64 формализована в Lean 4 с тремя свидетелями нетривиальности условия; PR #4364 принят в google-deepmind/formal-conjectures 14 августа 2026. Всего принято три PR.",
      en: "Green's open problem 64 formalized in Lean 4 with three witnesses that the condition is non-trivial; PR #4364 was merged into google-deepmind/formal-conjectures on August 14, 2026. Three PRs merged in total.",
    },
    kind: "research",
  },
  {
    ver: "v2026.06",
    when: { ru: "июнь 2026", en: "June 2026" },
    title: { ru: "Воспроизведён SOTA-результат AlphaEvolve", en: "Reproduced AlphaEvolve's SOTA result" },
    body: {
      ru: "Эволюционный LLM-пайплайн (OpenEvolve) на задаче минимального перекрытия Эрдёша сошёлся за ~10 итераций к численной границе уровня SOTA. Тот же результат на двух независимых бэкендах, с верификатором в одну команду. Открытый репозиторий.",
      en: "An evolutionary LLM pipeline (OpenEvolve) on the Erdos minimum-overlap problem converged in ~10 iterations to the SOTA numerical bound. Same result on two independent backends, with a one-command verifier. Open repository.",
    },
    kind: "research",
  },
  {
    ver: "v2026.06",
    when: { ru: "июнь 2026", en: "June 2026" },
    title: { ru: "Доказательства Lean приняты в репозиторий DeepMind", en: "Lean proofs merged into DeepMind's repository" },
    body: {
      ru: "ИИ-конвейер выдал машинно-проверяемые доказательства в Lean 4 / Mathlib: Эрдёш 1084 (PR #4245, 15 июня) и Эрдёш 1052 (PR #4244, 22 июня) приняты после ревью мейнтейнеров. Это формализации известных результатов, не решения открытых задач.",
      en: "An AI pipeline produced machine-verified Lean 4 / Mathlib proofs: Erdos 1084 (PR #4245, June 15) and Erdos 1052 (PR #4244, June 22) were merged after maintainer review. These are formalizations of known results, not solutions of open problems.",
    },
    kind: "research",
  },
  {
    ver: "v2026.06",
    when: { ru: "июнь 2026", en: "June 2026" },
    title: { ru: "Content Factory в продакшене", en: "Content Factory in production" },
    body: {
      ru: "Платформа генерации контента под несколько каналов: FastAPI-бэкенд, Vite-фронт, оркестрация LLM-провайдеров с фолбэком, очередь воркеров и публикация по расписанию.",
      en: "A content platform for several channels: FastAPI backend, Vite frontend, LLM-provider orchestration with fallback, a worker queue and scheduled publishing.",
    },
    kind: "prod",
  },
  {
    ver: "v2026.04",
    when: { ru: "апрель 2026", en: "April 2026" },
    title: { ru: "Торговая инфра: миграция протокола без простоя", en: "Trading infra: zero-downtime protocol migration" },
    body: {
      ru: "Перевёл всю серию торговых ботов на новый формат протокола. Сверка побайтно с эталонной реализацией, smoke на каждом боте перед раскаткой, ноль пропущенных торговых дней.",
      en: "Moved the entire series of trading bots to a new protocol format. Byte-for-byte verification against the reference, a smoke test on every bot before rollout, zero missed trading days.",
    },
    kind: "infra",
  },
  {
    ver: "v2026.03",
    when: { ru: "март 2026", en: "March 2026" },
    title: { ru: "Rust executor — ×13 ускорение", en: "Rust executor - 13x speed-up" },
    body: {
      ru: "Переписал критический путь отправки ордеров на Rust. Время отправки упало с 290–596 мс до 18–41 мс — это в 13 раз. Python остался оркестратором, Rust — горячим путём.",
      en: "Rewrote the order hot path in Rust. Submission dropped from 290-596 ms to 18-41 ms, a 13x gain. Python stayed as the orchestrator, Rust as the hot path.",
    },
    kind: "perf",
  },
];
