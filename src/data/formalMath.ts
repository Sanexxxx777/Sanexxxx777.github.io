import type { Bi, Meta } from "./types";

/* Formal-math line: Lean proofs @ DeepMind + the OpenEvolve search, folded into
   one flagship-style block (so they are not repeated as standalone project cards). */
export const formalStats: Meta[] = [
  { v: "2", k: { ru: "Задачи Эрдёша вмёржены в DeepMind", en: "Erdos problems merged into DeepMind" } },
  { v: "M₁–₅", k: { ru: "Значения min-overlap доказаны", en: "min-overlap values proved" } },
  { v: "99.5%", k: { ru: "Совпадение с SOTA-границей", en: "match to the SOTA bound" } },
  { v: "0 sorry", k: { ru: "Ядро Lean, аксиомы чисты", en: "Lean kernel, clean axioms" } },
];

export type FormalItem = {
  code: string;
  title: Bi;
  desc: Bi;
  status: Bi;
  link?: string;
};

export const formalItems: FormalItem[] = [
  {
    code: "E1084",
    title: { ru: "Эрдёш 1084", en: "Erdos 1084" },
    desc: {
      ru: "f₁(n) = n−1: максимум пар точек на единичном расстоянии среди n точек на прямой. Комбинаторика.",
      en: "f1(n) = n-1: the maximum number of unit-distance pairs among n points on a line. Combinatorics.",
    },
    status: { ru: "вмёржено", en: "merged" },
    link: "https://github.com/google-deepmind/formal-conjectures/pull/4245",
  },
  {
    code: "E1052",
    title: { ru: "Эрдёш 1052", en: "Erdos 1052" },
    desc: {
      ru: "24-значное унитарно совершенное число, доказано через мультипликативность σ*. Теория чисел.",
      en: "The 24-digit unitary perfect number, proved via multiplicativity of sigma-star. Number theory.",
    },
    status: { ru: "вмёржено", en: "merged" },
    link: "https://github.com/google-deepmind/formal-conjectures/pull/4244",
  },
  {
    code: "E36",
    title: { ru: "Эрдёш 36 — минимальное перекрытие", en: "Erdos 36 - minimum overlap" },
    desc: {
      ru: "M(1)…M(5) доказаны машинно — перебором всех сбалансированных разбиений. Та же задача, которую берёт эволюционный поиск ниже.",
      en: "M(1)...M(5) machine-proved by enumerating all balanced partitions. The same problem the evolutionary search below attacks.",
    },
    status: { ru: "на ревью", en: "under review" },
    link: "https://github.com/google-deepmind/formal-conjectures/pull/4362",
  },
  {
    code: "AE",
    title: { ru: "Эволюционный поиск", en: "Evolutionary search" },
    desc: {
      ru: "OpenEvolve (открытая реализация AlphaEvolve) на минимальном перекрытии Эрдёша: со слабого старта к численной SOTA-границе за ~10 итераций, на двух независимых бэкендах.",
      en: "OpenEvolve (the open-source AlphaEvolve) on the Erdos minimum-overlap: from a weak start to the numerical SOTA bound in ~10 iterations, on two independent backends.",
    },
    status: { ru: "public", en: "public" },
    link: "https://github.com/Sanexxxx777/erdos-openevolve",
  },
];
