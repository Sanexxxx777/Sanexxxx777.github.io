import type { Project } from "./types";

/* Desktop / game / OSS work — a separate section to show range beyond bots & services. */
export const apps: Project[] = [
  {
    id: "qwerty-switcher",
    kicker: { ru: "// продукт · macOS", en: "// product · macOS" },
    title: "Qwerty Switcher",
    desc: {
      ru: "Нативный автопереключатель раскладки для macOS: перехват клавиш через CGEventTap, определение языка словарём (Bloom-фильтр, 714K слов) + N-граммами, замена набранного слова на лету. Подписочная модель: 14-дневный триал, ключи с привязкой к устройству, лицензионный сервер с Ed25519-подписью ответов. 388 автоматических проверок ядра.",
      en: "A native macOS auto-switcher for keyboard layouts: key interception via CGEventTap, language detection with a dictionary (Bloom filter, 714K words) plus n-grams, replacing the typed word on the fly. Subscription model: a 14-day trial, device-locked keys, a license server with Ed25519-signed responses. 388 automated core checks.",
    },
    tags: ["Swift", "AppKit", "CGEventTap", "CryptoKit", "product"],
    meta: [
      { k: { ru: "Платформа", en: "Platform" }, v: "macOS 13+" },
      { k: { ru: "Модель", en: "Model" }, v: { ru: "подписка · триал 14 дней", en: "subscription · 14-day trial" } },
    ],
    status: "saas",
    year: "2026",
    link: "https://shulgin.is-a.dev/store/#apps",
  },
  {
    id: "sketchbook-planner",
    kicker: { ru: "// планировщик · macOS", en: "// planner · macOS" },
    title: "Sketchbook Planner",
    desc: {
      ru: "Планировщик недели поверх Things 3: свободные заметки превращаются в план через Claude, ответ модели проверяется по строгой JSON-схеме, изменения показываются до применения, есть откат и Undo. Нативная сборка Tauri v2, двусторонняя синхронизация с Things через AppleScript, оболочка PWA для телефона. Доведён до закрытой беты, выпущен под MIT.",
      en: "A weekly planner on top of Things 3: free-form notes become a plan through Claude, the model's answer is validated against a strict JSON schema, every change is previewed before it applies, with rollback and Undo. A native Tauri v2 build, two-way Things sync over AppleScript, a PWA shell for the phone. Taken to a private beta and released under MIT.",
    },
    tags: ["Tauri", "Rust", "AppleScript", "LLM", "OSS"],
    meta: [
      { k: { ru: "Платформа", en: "Platform" }, v: "macOS + PWA" },
      { k: { ru: "Лицензия", en: "License" }, v: "MIT" },
    ],
    status: "open",
    year: "2026",
    link: "https://github.com/Sanexxxx777/sketchbook-planner",
  },
  {
    id: "spread-monitor",
    kicker: { ru: "// десктоп-приложение", en: "// desktop app" },
    title: "Spread Monitor",
    desc: {
      ru: "Десктопное приложение для отслеживания спреда между торговыми площадками в реальном времени. Нативная сборка на Tauri (Rust + web-фронт), фоновые воркеры, алерты при расхождении цен. Ставится как обычное приложение.",
      en: "A desktop app that tracks the price spread across trading venues in real time. A native Tauri build (Rust + web frontend), background workers, alerts on divergence. Installs like a regular app.",
    },
    tags: ["Tauri", "Rust", "TypeScript", "desktop"],
    meta: [
      { k: { ru: "Платформа", en: "Platform" }, v: "macOS" },
      { k: { ru: "Тип", en: "Type" }, v: "desktop" },
    ],
    status: "pet",
    year: "2026",
    link: "https://github.com/Sanexxxx777/spread-monitor",
  },
  {
    id: "edict",
    kicker: { ru: "// игра / симулятор", en: "// game / sim" },
    title: "EDICT",
    desc: {
      ru: "Браузерная игра-симулятор «бога»: детерминированный игровой движок на TypeScript + Vite, прогрессия и события мира, рендер без тяжёлых движков. В активной разработке.",
      en: "A browser god-sim game: a deterministic TypeScript + Vite engine, world progression and events, rendering without heavy engines. In active development.",
    },
    tags: ["TypeScript", "Vite", "Canvas", "game"],
    meta: [
      { k: { ru: "Тип", en: "Type" }, v: { ru: "веб-игра", en: "web game" } },
      { k: { ru: "Статус", en: "Status" }, v: { ru: "в разработке", en: "in dev" } },
    ],
    status: "pet",
    year: "2026",
  },
  {
    id: "pm2-cockpit",
    kicker: { ru: "// open-source", en: "// open-source" },
    title: "pm2-cockpit",
    desc: {
      ru: "Аварийный пульт управления процессами через Telegram: закреплённое сообщение с тумблерами stop/start по pm2-процессам, подтверждения, вайтлист. Опубликован как OSS под MIT.",
      en: "An emergency process-control cockpit over Telegram: a pinned message with stop/start toggles for pm2 processes, confirmations, an allowlist. Published as OSS under MIT.",
    },
    tags: ["Node.js", "Telegram", "PM2", "OSS"],
    meta: [
      { k: { ru: "Лицензия", en: "License" }, v: "MIT" },
      { k: { ru: "Тип", en: "Type" }, v: { ru: "публичный", en: "public" } },
    ],
    status: "open",
    year: "2026",
    link: "https://github.com/Sanexxxx777/pm2-cockpit",
  },
  {
    id: "desktop-utils",
    kicker: { ru: "// нативные утилиты", en: "// native utilities" },
    title: "Desktop Utilities",
    desc: {
      ru: "Набор настольных утилит: планировщики задач на Tauri (Rust + web). Маленькие инструменты, которые закрывают ежедневные задачи.",
      en: "A set of desktop utilities: Tauri (Rust + web) task planners. Small tools that handle everyday needs.",
    },
    tags: ["Tauri", "Rust", "macOS"],
    meta: [
      { k: { ru: "Платформа", en: "Platform" }, v: "macOS" },
      { k: { ru: "Стек", en: "Stack" }, v: "Tauri" },
    ],
    status: "pet",
    year: "2026",
  },
];
