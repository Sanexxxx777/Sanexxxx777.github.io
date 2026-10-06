import type { Principle } from "./types";

export const principles: Principle[] = [
  {
    tag: { ru: "Объём", en: "Scope" },
    num: "01",
    h: { ru: "Сначала договариваемся о «готово»", en: "Agree on done first" },
    p: {
      ru: "До кода договариваемся, что значит «готово»: что на входе, что на выходе, какие ограничения и как проверим.",
      en: "Before I write code we agree on what done means: inputs, outputs, limits and how we will check it.",
    },
  },
  {
    tag: { ru: "24/7", en: "24/7" },
    num: "02",
    h: { ru: "Держу в проде, а не в демо", en: "I run it in prod, not in a demo" },
    p: {
      ru: "Задача закрыта, когда она в проде. Не «локально запускается», а реально держит трафик, переживает рестарты, восстанавливается после сбоя сети.",
      en: "A task is done when it's in production. Not \"runs locally\" but actually holds traffic, survives restarts, recovers from network drops.",
    },
  },
  {
    tag: { ru: "Цифры", en: "Numbers" },
    num: "03",
    h: { ru: "Измеряю, а не угадываю", en: "I measure, not guess" },
    p: {
      ru: "«Кажется, медленно» не аргумент. Бенчмарк, профайлер, цифры. Нет измеримого прироста, значит оптимизация не нужна.",
      en: "\"Feels slow\" is not an argument. Benchmark, profiler, numbers. No measurable gain means the optimization isn't needed.",
    },
  },
  {
    tag: { ru: "Передача", en: "Handover" },
    num: "04",
    h: { ru: "Передаю, а не держу", en: "Handover, not hostage" },
    p: {
      ru: "Вы получаете код, доступы и короткую инструкцию: что где работает, как перезапустить, что значит каждый алерт.",
      en: "You get the code, the access and a short runbook: what runs where, how to restart it, what each alert means.",
    },
  },
];
