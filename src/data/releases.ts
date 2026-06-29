import type { Release } from "./types";

const W = {
  thisWeek: { ru: "на этой неделе", en: "this week" },
  lastMonth: { ru: "в прошлом месяце", en: "last month" },
  prevQ: { ru: "пред. квартал", en: "prev quarter" },
  q1: { ru: "Q1", en: "Q1" },
  q4: { ru: "Q4 пр. года", en: "Q4 last year" },
  pet: { ru: "pet-project", en: "pet-project" },
};

export const releases: Release[] = [
  {
    ver: "v2026.06",
    when: W.thisWeek,
    title: { ru: "Доказательства Lean вмёржены в Google DeepMind", en: "Lean proofs merged into Google DeepMind" },
    body: {
      ru: "ИИ-конвейер выдал машинно-проверяемые доказательства в Lean 4 / Mathlib для открытого репозитория DeepMind formal-conjectures. Обе задачи Эрдёша вмёржены.",
      en: "An AI pipeline produced machine-verified Lean 4 / Mathlib proofs for DeepMind's open formal-conjectures repo. Both Erdos problems merged.",
    },
    kind: "research",
  },
  {
    ver: "v2026.06",
    when: W.thisWeek,
    title: { ru: "Content Factory в продакшене", en: "Content Factory in production" },
    body: {
      ru: "Платформа генерации контента под несколько каналов: FastAPI-бэкенд, Vite-фронт, оркестрация LLM-провайдеров с фолбэком, очередь воркеров и публикация по расписанию.",
      en: "A content platform for several channels: FastAPI backend, Vite frontend, LLM-provider orchestration with fallback, a worker queue and scheduled publishing.",
    },
    kind: "prod",
  },
  {
    ver: "v2026.05",
    when: W.lastMonth,
    title: { ru: "Crime Token Scan — продакшен-релиз", en: "Crime Token Scan - production release" },
    body: {
      ru: "Telegram-бот для глубокой аналитики криптоактивов. Собственный пайплайн сбора и оценки сигналов, AI-комментарий по каждому событию, чистый визуал. Работает 24/7.",
      en: "A Telegram bot for deep crypto-asset analytics. A custom pipeline that collects and scores signals, an AI comment on every event, clean visuals. Running 24/7.",
    },
    kind: "prod",
  },
  {
    ver: "v2026.05",
    when: W.lastMonth,
    title: { ru: "25.VPN — коммерческий запуск", en: "25.VPN - commercial launch" },
    body: {
      ru: "Коммерческий VPN-сервис на собственной инфраструктуре. Telegram-бот для оформления и продления подписки, мульти-сервер раскат, защита от шеринга и утечек. Платящие пользователи.",
      en: "A commercial VPN service on custom infrastructure. A Telegram bot for sign-up and renewals, multi-server rollout, protection against sharing and leaks. Paying users.",
    },
    kind: "prod",
  },
  {
    ver: "v2026.05",
    when: W.lastMonth,
    title: { ru: "MM Rewards Live — маркет-мейкер в продакшене", en: "MM Rewards Live - market maker in production" },
    body: {
      ru: "Маркет-мейкер на prediction-рынках под программу ликвидности. Собственный движок ладдеров, аккуратная сверка позиций, собственное казначейство. Круглосуточно без надзора.",
      en: "A market maker on prediction markets for a liquidity-rewards program. A custom ladder engine, careful position reconciliation, its own treasury. Around the clock, unattended.",
    },
    kind: "prod",
  },
  {
    ver: "v2026.05",
    when: W.lastMonth,
    title: { ru: "Manga Translator — pipeline в проде", en: "Manga Translator - pipeline in production" },
    body: {
      ru: "Скачивание, OCR через MIT-detector, перевод через Gemini API, рендер обратно в баблы и упаковка в CBZ. Cron-расписание подкидывает новые главы в библиотеку автоматически.",
      en: "Download, OCR via an MIT detector, translation through the Gemini API, render back into bubbles and pack into CBZ. A cron schedule feeds new chapters into the library automatically.",
    },
    kind: "prod",
  },
  {
    ver: "v2026.04",
    when: W.prevQ,
    title: { ru: "Transaction Guardian — клиентский релиз", en: "Transaction Guardian - client release" },
    body: {
      ru: "On-chain мониторинг для нескольких клиентов: подписка на события, фильтры по адресам и сигнатурам, алерты в Telegram, дашборд. Ноль пропусков критичных событий с момента запуска.",
      en: "On-chain monitoring for several clients: event subscriptions, filters by address and signature, Telegram alerts, a dashboard. Zero missed critical events since launch.",
    },
    kind: "prod",
  },
  {
    ver: "v2026.04",
    when: W.prevQ,
    title: { ru: "Торговая инфра: миграция протокола без простоя", en: "Trading infra: zero-downtime protocol migration" },
    body: {
      ru: "Перевёл всю серию торговых ботов на новый формат протокола. Сверка побайтно с эталонной реализацией, smoke на каждом боте перед раскаткой, ноль пропущенных торговых дней.",
      en: "Moved the entire series of trading bots to a new protocol format. Byte-for-byte verification against the reference, a smoke test on every bot before rollout, zero missed trading days.",
    },
    kind: "infra",
  },
  {
    ver: "v2026.03",
    when: W.prevQ,
    title: { ru: "NFA Dashboard — full-stack мониторинг", en: "NFA Dashboard - full-stack monitoring" },
    body: {
      ru: "Панель для инфраструктуры: статус серверов и сервисов, метрики, алерты, daily-digest в Telegram. 7 вкладок, persistence в JSON, cron-пуши. Backend, frontend, deploy — всё своё.",
      en: "An infrastructure panel: server and service status, metrics, alerts, a daily digest in Telegram. 7 tabs, JSON persistence, cron pushes. Backend, frontend, deploy, all my own.",
    },
    kind: "prod",
  },
  {
    ver: "v2026.03",
    when: W.prevQ,
    title: { ru: "Rust executor — ×13 ускорение", en: "Rust executor - 13x speed-up" },
    body: {
      ru: "Переписал критический путь отправки ордеров на Rust. Время отправки упало с 290–596 мс до 18–41 мс — это в 13 раз. Python остался оркестратором, Rust — горячим путём.",
      en: "Rewrote the order hot path in Rust. Submission dropped from 290-596 ms to 18-41 ms, a 13x gain. Python stayed as the orchestrator, Rust as the hot path.",
    },
    kind: "perf",
  },
  {
    ver: "v2026.02",
    when: W.q1,
    title: { ru: "Genetic Optimizer v8", en: "Genetic Optimizer v8" },
    body: {
      ru: "Эволюционная оптимизация параметров стратегий. Walk-forward валидация, параллелизация на CPU, fitness с учётом drawdown и Sharpe. В проде дала +59% PnL против ручной настройки.",
      en: "Evolutionary optimization of strategy parameters. Walk-forward validation, CPU parallelization, a fitness function accounting for drawdown and Sharpe. In production it delivered +59% PnL versus manual tuning.",
    },
    kind: "research",
  },
  {
    ver: "v2025.12",
    when: W.q4,
    title: { ru: "Web3 Lead Discovery — тестовое для студии", en: "Web3 Lead Discovery - test task for a studio" },
    body: {
      ru: "Full-pipeline парсинг и LLM-скоринг крипто-лидов за пару дней. 5+ источников, дедуп, нормализация, экспорт в CRM-формат. Принято с положительным фидбеком.",
      en: "A full pipeline, scraping plus LLM scoring of crypto leads, in a couple of days. 5+ sources, dedup, normalization, export to a CRM format. Accepted with positive feedback.",
    },
    kind: "research",
  },
  {
    ver: "v2025.10",
    when: W.q4,
    title: { ru: "Setup Manager — публичный релиз", en: "Setup Manager - public release" },
    body: {
      ru: "Веб-инструмент для управления конфигом и деплоем рабочей среды: пресеты окружений, синхронизация настроек, быстрая инициализация на новой машине. На собственном домене через Cloudflare Tunnel.",
      en: "A web tool for managing environment config and deployment: presets, settings sync, fast bootstrap on a new machine. On a custom domain via Cloudflare Tunnel.",
    },
    kind: "prod",
  },
  {
    ver: "v2025.09",
    when: W.q4,
    title: { ru: "Sector Map Dashboard — публичный релиз", en: "Sector Map Dashboard - public release" },
    body: {
      ru: "Веб-дашборд крипторынка по секторам с интерактивными хитмапами. На собственном домене через Cloudflare Tunnel, доступен 24/7. Backend агрегирует CEX/DEX, фронт на ванильном JS+D3.",
      en: "A crypto-market web dashboard by sector with interactive heatmaps. On a custom domain via Cloudflare Tunnel, available 24/7. The backend aggregates CEX/DEX, the frontend is vanilla JS + D3.",
    },
    kind: "prod",
  },
  {
    ver: "v2026.05",
    when: W.pet,
    title: { ru: "HH AutoApply v1.0 — продакшен", en: "HH AutoApply v1.0 - production" },
    body: {
      ru: "17 модулей, автологин через cookies, A/B сопроводительных, Telegram-управление. Stealth Playwright переживает session timeouts и captcha без даунтайма. LLM-ответы в чатах с защитой от шаблонов.",
      en: "17 modules, cookie auto-login, A/B cover letters, Telegram control. Stealth Playwright survives session timeouts and captchas without downtime. LLM chat replies with template protection.",
    },
    kind: "prod",
  },
];
