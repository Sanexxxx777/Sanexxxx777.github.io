import type { Subsystem, Meta } from "./types";

/* Results only. Low-level implementation details intentionally omitted. */
export const flagshipStats: Meta[] = [
  { v: "×13", k: { ru: "ниже задержка заявки", en: "lower order latency" } },
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
      ru: "Котирование ликвидности под программу rewards, аккуратная сверка позиций, собственное казначейство. Круглые сутки, с алертами и ручным стопом.",
      en: "Liquidity quoting for a rewards program, careful position reconciliation, its own treasury. Around the clock, with alerts and a manual stop.",
    },
    tags: ["CLOB", "trading", "treasury"],
  },
  {
    code: "S3",
    title: { ru: "Контур ресёрча", en: "Edge research" },
    desc: {
      ru: "Исследование рынка на собственных данных: 3.9M сделок, 6249 кошельков.",
      en: "Market research on our own data: 3.9M trades across 6,249 wallets.",
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
      ru: "Параметры подбираются и проверяются на истории до выката.",
      en: "Parameters are tuned and checked on history before rollout.",
    },
    tags: ["backtest", "NumPy", "research"],
  },
];
