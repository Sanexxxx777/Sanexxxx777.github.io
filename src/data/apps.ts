import type { Project } from "./types";

/* Desktop / game / OSS work — a separate section to show range beyond bots & services. */
export const apps: Project[] = [
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
  },
  {
    id: "desktop-utils",
    kicker: { ru: "// нативные утилиты", en: "// native utilities" },
    title: "Desktop Utilities",
    desc: {
      ru: "Набор настольных утилит: свитчер раскладки клавиатуры на нативном Swift для macOS и планировщики задач на Tauri (Rust + web). Маленькие инструменты, которые закрывают ежедневные задачи.",
      en: "A set of desktop utilities: a native Swift keyboard-layout switcher for macOS and Tauri (Rust + web) task planners. Small tools that handle everyday needs.",
    },
    tags: ["Swift", "Tauri", "Rust", "macOS"],
    meta: [
      { k: { ru: "Платформа", en: "Platform" }, v: "macOS" },
      { k: { ru: "Стек", en: "Stack" }, v: "Swift · Tauri" },
    ],
    status: "pet",
    year: "2026",
  },
];
