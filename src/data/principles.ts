import type { Principle } from "./types";

export const principles: Principle[] = [
  {
    tag: { ru: "Код", en: "Code" },
    num: "01",
    h: { ru: "Пишу, а не рассказываю", en: "I build, not talk" },
    p: {
      ru: "Не курсы, не сертификаты. Уровень доказывает прод — каждая моя система живёт 24/7 без присмотра.",
      en: "No courses, no certificates. Production proves the level: every system I build runs 24/7, unattended.",
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
    tag: { ru: "R&D", en: "R&D" },
    num: "04",
    h: { ru: "Беру нерешённое", en: "I take the unsolved" },
    p: {
      ru: "Не выбираю задачи по знакомости стека. «Такого ещё никто не делал» — это моё. Незнакомый API, новый инструмент — разберусь и доведу до прода.",
      en: "I don't pick tasks by how familiar the stack is. \"No one has done this yet\" is mine. Unfamiliar API, new tool, I'll figure it out and ship it.",
    },
  },
];
