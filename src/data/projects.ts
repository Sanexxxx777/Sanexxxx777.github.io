import type { Project } from "./types";

/* Trading subsystems (bots / MM / ENIGMA / WS relay / GA / VMC) are folded into the
   flagship block, and the formal-math line (Lean @ DeepMind + OpenEvolve) into the
   FormalMath block, so neither repeats here. Ordered strongest-first. */
export const projects: Project[] = [
  {
    id: "content-factory",
    kicker: { ru: "// контент-платформа", en: "// content platform" },
    title: "Content Factory",
    desc: {
      ru: "Платформа генерации контента под несколько каналов. FastAPI-бэкенд и Vite-фронт, оркестрация нескольких LLM-провайдеров с фолбэком, очередь воркеров и публикация по расписанию. Продакшен 24/7.",
      en: "A content-generation platform for several channels. A FastAPI backend and a Vite frontend, multi-provider LLM orchestration with fallback, a worker queue, scheduled publishing. Running 24/7.",
    },
    tags: ["Python", "FastAPI", "Vite", "LLM"],
    meta: [
      { k: { ru: "Тип", en: "Type" }, v: "web+LLM" },
      { k: { ru: "Статус", en: "Status" }, v: "live" },
    ],
    status: "prod",
    year: "2026",
  },
  {
    id: "crime",
    kicker: { ru: "// глубокая аналитика", en: "// deep analytics" },
    title: "Crime Token Scan",
    desc: {
      ru: "Telegram-бот для глубокой аналитики криптоактивов. Собственный пайплайн сбора и оценки сигналов, AI-комментарий по каждому событию, чистый визуал. Продакшен 24/7.",
      en: "A Telegram bot for deep crypto-asset analytics. A custom pipeline that collects and scores signals, an AI comment on every event, clean visuals. Running 24/7.",
    },
    tags: ["Python", "LLM", "Telegram", "analytics"],
    meta: [
      { k: { ru: "Тип", en: "Type" }, v: { ru: "публичный", en: "public" } },
      { k: { ru: "Статус", en: "Status" }, v: "live" },
    ],
    status: "prod",
    year: "2026",
  },
  {
    id: "vpn",
    kicker: { ru: "// VPN-сервис", en: "// VPN service" },
    title: "25.VPN",
    desc: {
      ru: "Коммерческий VPN-сервис с собственной инфраструктурой. Telegram-бот для оформления и продления подписки, мульти-сервер раскат, защита от шеринга и утечек. Платящие пользователи, продакшен 24/7.",
      en: "A commercial VPN service on custom infrastructure. A Telegram bot for sign-up and renewals, multi-server rollout, protection against sharing and leaks. Paying users, running 24/7.",
    },
    tags: ["Python", "Linux", "network", "Telegram"],
    meta: [
      { k: { ru: "Тип", en: "Type" }, v: "SaaS" },
      { k: { ru: "Статус", en: "Status" }, v: "live" },
    ],
    status: "saas",
    year: "2026",
  },
  {
    id: "tx-guardian",
    kicker: { ru: "// клиентский", en: "// client work" },
    title: "Transaction Guardian",
    desc: {
      ru: "Клиентский сервис мониторинга on-chain транзакций. Подписка на события, фильтры по адресам и сигнатурам, алерты в Telegram, дашборд со статистикой. Работает 24/7 для нескольких клиентов.",
      en: "A client service for monitoring on-chain transactions. Event subscriptions, filters by address and signature, Telegram alerts, a stats dashboard. Runs 24/7 for several clients.",
    },
    tags: ["Python", "Web3", "EVM", "Telegram"],
    meta: [
      { k: { ru: "Тип", en: "Type" }, v: { ru: "клиентский", en: "client" } },
      { k: { ru: "Статус", en: "Status" }, v: "live" },
    ],
    status: "client",
    year: "2026",
  },
  {
    id: "hub-research",
    kicker: { ru: "// клиентский", en: "// client work" },
    title: "Hub Research",
    desc: {
      ru: "Клиентский AI-ассистент крипто-ресёрча. Собирает данные из множества источников, сводит в структурированные отчёты с LLM-аналитикой и отдаёт через бота. Работает в продакшене у заказчика.",
      en: "A client AI assistant for crypto research. It gathers data from many sources, distills it into structured reports with LLM analysis, and delivers them through a bot. Running in production for the client.",
    },
    tags: ["Python", "LLM", "Gemini", "research"],
    meta: [
      { k: { ru: "Тип", en: "Type" }, v: { ru: "клиентский", en: "client" } },
      { k: { ru: "Статус", en: "Status" }, v: "live" },
    ],
    status: "client",
    year: "2026",
  },
  {
    id: "twitter-intel",
    kicker: { ru: "// клиентский", en: "// client work" },
    title: "Twitter Intel",
    desc: {
      ru: "Мониторинг X/Twitter по крипто-проектам с AI-саммари, скорингом важности и фильтром шума. Алерты в Telegram с инлайн-управлением. Клиентский продакшен.",
      en: "X/Twitter monitoring across crypto projects with AI summaries, importance scoring and noise filtering. Telegram alerts with inline controls. Client production.",
    },
    tags: ["Python", "LLM", "Telegram", "monitoring"],
    meta: [
      { k: { ru: "Тип", en: "Type" }, v: { ru: "клиентский", en: "client" } },
      { k: { ru: "Статус", en: "Status" }, v: "live" },
    ],
    status: "client",
    year: "2026",
  },
  {
    id: "sector-map",
    kicker: { ru: "// веб-приложение", en: "// web app" },
    title: "Sector Map",
    desc: {
      ru: "Веб-дашборд крипторынка с интерактивными хитмапами по секторам. Backend на Python агрегирует данные из CEX/DEX, фронт — лёгкий SPA на ванильном JS+D3. Развёрнут на своём домене через Cloudflare Tunnel.",
      en: "A crypto-market web dashboard with interactive heatmaps by sector. A Python backend aggregates CEX/DEX data; the frontend is a lightweight SPA in vanilla JS + D3. Deployed on a custom domain via Cloudflare Tunnel.",
    },
    tags: ["Python", "JavaScript", "D3", "Cloudflare"],
    meta: [
      { k: { ru: "Хост", en: "Host" }, v: "self-hosted" },
      { k: { ru: "Аптайм", en: "Uptime" }, v: "99%+" },
    ],
    status: "prod",
    year: "2025",
    link: "https://github.com/Sanexxxx777/crypto-dashboard",
  },
  {
    id: "setup-manager",
    kicker: { ru: "// devops-tool", en: "// devops tool" },
    title: "Setup Manager",
    desc: {
      ru: "Веб-инструмент для управления конфигом и деплоем рабочей среды: пресеты окружений, синхронизация настроек, быстрая инициализация на новой машине. Публичный сайт на собственном домене.",
      en: "A web tool for managing environment config and deployment: environment presets, settings sync, fast bootstrap on a new machine. Public site on a custom domain.",
    },
    tags: ["Node.js", "JavaScript", "CSS", "deploy"],
    meta: [
      { k: { ru: "Тип", en: "Type" }, v: { ru: "публичный", en: "public" } },
      { k: { ru: "Хост", en: "Host" }, v: "Cloudflare" },
    ],
    status: "prod",
    year: "2025",
  },
  {
    id: "nfa-dashboard",
    kicker: { ru: "// monitoring", en: "// monitoring" },
    title: "NFA Dashboard",
    desc: {
      ru: "Панель мониторинга инфраструктуры: статус серверов и сервисов, метрики, алерты, daily-digest в Telegram. 7 вкладок, persistence в JSON, cron-пуши. Полный full-stack: backend, frontend, deploy.",
      en: "An infrastructure-monitoring panel: server and service status, metrics, alerts, a daily digest in Telegram. 7 tabs, JSON persistence, cron pushes. Full-stack end to end: backend, frontend, deploy.",
    },
    tags: ["Node.js", "JavaScript", "PM2", "cron"],
    meta: [
      { k: { ru: "Вкладок", en: "Tabs" }, v: "7" },
      { k: { ru: "Стек", en: "Stack" }, v: "full-stack" },
    ],
    status: "prod",
    year: "2026",
    link: "https://github.com/Sanexxxx777/nfa-dashboard-demo",
  },
  {
    id: "manga",
    kicker: { ru: "// личный инструмент", en: "// personal tool" },
    title: "Manga Translator",
    desc: {
      ru: "Pipeline для скачивания манги, OCR через MIT-detector, перевод через Gemini API, рендер обратно в баблы и упаковка в CBZ. Работает по расписанию: новые главы прилетают в библиотеку автоматически.",
      en: "A pipeline that downloads manga, OCR via an MIT detector, translation through the Gemini API, renders text back into bubbles and packs it into CBZ. Runs on a schedule: new chapters land in the library automatically.",
    },
    tags: ["Python", "OCR", "Gemini", "cron"],
    meta: [
      { k: { ru: "Источник", en: "Source" }, v: "MangaDex" },
      { k: { ru: "Output", en: "Output" }, v: "CBZ" },
    ],
    status: "pet",
    year: "2026",
  },
  {
    id: "hh-autoapply",
    kicker: { ru: "// дата-пайплайн", en: "// data pipeline" },
    title: "Job Radar",
    desc: {
      ru: "17-модульный пайплайн агрегации вакансий: сводит 15+ источников в один поток, LLM-скоринг релевантности, дедупликация и нормализация, оркестрация воркеров. Карточки и управление — через Telegram.",
      en: "A 17-module vacancy-aggregation pipeline: pulls 15+ sources into one feed, LLM relevance scoring, dedup and normalization, worker orchestration. Surfaced and controlled through Telegram.",
    },
    tags: ["Python", "Playwright", "LLM", "Telegram"],
    meta: [
      { k: { ru: "Модулей", en: "Modules" }, v: "17" },
      { k: { ru: "Источников", en: "Sources" }, v: "15+" },
    ],
    status: "pet",
    year: "2026",
  },
];
