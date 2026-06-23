import type { Subsystem, Meta } from "./types";

/* Results only. Low-level implementation details intentionally omitted. */
export const flagshipStats: Meta[] = [
  { v: "×13", k: { ru: "Латентность vs baseline", en: "Latency vs baseline" } },
  { v: "sub-50ms", k: { ru: "p99 отправки ордера", en: "p99 order submit" } },
  { v: "24/7", k: { ru: "Без надзора", en: "Unattended" } },
  { v: "3.9M", k: { ru: "Сделок проанализировано", en: "Trades analyzed" } },
];

export const subsystems: Subsystem[] = [
  {
    code: "S1",
    title: { ru: "Слой исполнения", en: "Execution layer" },
    desc: {
      ru: "Серия торговых ботов: async-оркестрация на Python и Rust на горячем пути. Sub-50ms отправка ордеров, ×13 к латентности.",
      en: "A series of trading bots: async Python orchestration with Rust on the hot path. Sub-50ms order submission, a 13x latency gain.",
    },
    tags: ["Python", "Rust", "async"],
  },
  {
    code: "S2",
    title: { ru: "Движок маркет-мейкинга", en: "Market-making engine" },
    desc: {
      ru: "Котирование ликвидности под программу rewards, аккуратная сверка позиций, собственное казначейство. Круглые сутки без надзора.",
      en: "Liquidity quoting for a rewards program, careful position reconciliation, its own treasury. Around the clock, unattended.",
    },
    tags: ["CLOB", "trading", "treasury"],
  },
  {
    code: "S3",
    title: { ru: "Контур ресёрча", en: "Edge research" },
    desc: {
      ru: "Поиск прибыльных трейдеров: 3.9M сделок, 6249 кошельков, ранжирование по устойчивому эджу, фильтр манипуляторов.",
      en: "Finding profitable traders: 3.9M trades, 6249 wallets, ranked by durable edge, manipulators filtered out.",
    },
    tags: ["analytics", "EVM", "data"],
  },
  {
    code: "S4",
    title: { ru: "Low-latency backbone", en: "Low-latency backbone" },
    desc: {
      ru: "Мультиплексор рыночных WebSocket-потоков: одно upstream-соединение на всех ботов, переподключение без потери данных.",
      en: "A market WebSocket multiplexer: one upstream connection feeding every bot, reconnect without data loss.",
    },
    tags: ["async", "WebSockets", "infra"],
  },
  {
    code: "S5",
    title: { ru: "Калибровка стратегий", en: "Strategy calibration" },
    desc: {
      ru: "Генетическая оптимизация параметров с walk-forward валидацией. +59% PnL против ручной настройки.",
      en: "Genetic parameter optimization with walk-forward validation. +59% PnL versus manual tuning.",
    },
    tags: ["GA", "backtest", "NumPy"],
  },
];
