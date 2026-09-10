import type { Bi } from "./types";

/* Карта живых систем. Единственный источник для сцены «Пульт» в hero и для
   цифры «систем в проде» в hero-статистике: узлов ровно столько, сколько
   систем реально работает, рёбра = настоящие связи (общая инфраструктура,
   общий редактор, продажа через витрину). Только публичные имена, никаких
   адресов, портов и методов. Снятые с эксплуатации системы сюда НЕ попадают
   (они остаются в списке «Работ» со статусом «снят»). */

export type LiveKind = "system" | "sub" | "site" | "product" | "tool";

export type LiveNode = {
  id: string;
  name: Bi;
  kind: LiveKind;
  since: string;      // год запуска
  anchor: string;     // куда ведёт клик: хэш строки в «Работах»/«Сайтах» или путь страницы
  group: "trading" | "products" | "sites";
};

export const liveNodes: LiveNode[] = [
  /* торговая инфраструктура: один хаб и пять подсистем из блока флагмана */
  { id: "trading",    name: { ru: "Торговая инфраструктура", en: "Trading infrastructure" }, kind: "system", since: "2025", anchor: "#flagship-trading", group: "trading" },
  { id: "t-backbone", name: { ru: "WS-мультиплексор", en: "WS multiplexer" },               kind: "sub",    since: "2025", anchor: "#flagship-trading", group: "trading" },
  { id: "t-exec",     name: { ru: "Слой исполнения", en: "Execution layer" },               kind: "sub",    since: "2025", anchor: "#flagship-trading", group: "trading" },
  { id: "t-mm",       name: { ru: "Движок маркет-мейкинга", en: "Market-making engine" },   kind: "sub",    since: "2025", anchor: "#flagship-trading", group: "trading" },
  { id: "t-research", name: { ru: "Контур ресёрча", en: "Research loop" },                  kind: "sub",    since: "2025", anchor: "#flagship-trading", group: "trading" },
  { id: "t-calib",    name: { ru: "Калибровка стратегий", en: "Strategy calibration" },     kind: "sub",    since: "2026", anchor: "#flagship-trading", group: "trading" },

  /* продукты и инструменты, которые работают сейчас */
  { id: "content-factory",   name: { ru: "Content Factory", en: "Content Factory" },              kind: "system",  since: "2026", anchor: "#work-content-factory",        group: "products" },
  { id: "setup-manager",     name: { ru: "Setup Manager", en: "Setup Manager" },                  kind: "system",  since: "2025", anchor: "#work-setup-manager",          group: "products" },
  { id: "job-search-agents", name: { ru: "AI Job Search Bots", en: "AI Job Search Bots" },        kind: "system",  since: "2026", anchor: "#work-job-search-agents",      group: "products" },
  { id: "living-canvas",     name: { ru: "Living Canvas", en: "Living Canvas" },                  kind: "system",  since: "2026", anchor: "#work-living-canvas",          group: "products" },
  { id: "qwerty",            name: { ru: "Qwerty Switcher", en: "Qwerty Switcher" },              kind: "product", since: "2026", anchor: "#work-qwerty-switcher",        group: "products" },
  { id: "site-check",        name: { ru: "Проверка сайта", en: "Site check" },                    kind: "tool",    since: "2026", anchor: "#work-site-check",             group: "products" },
  { id: "agi-demo",          name: { ru: "Agent Graph Inspector", en: "Agent Graph Inspector" },  kind: "tool",    since: "2026", anchor: "#work-agent-graph-inspector",  group: "products" },

  /* живые сайты: витрина и клиентские */
  { id: "store",       name: { ru: "Витрина", en: "Storefront" },                         kind: "site", since: "2026", anchor: "#site-store",       group: "sites" },
  { id: "horsesfarm",  name: { ru: "Конный двор", en: "Horse yard" },                     kind: "site", since: "2026", anchor: "#site-horsesfarm",  group: "sites" },
  { id: "tanyabunina", name: { ru: "Курс Татьяны Буниной", en: "Tatyana Bunina's course" }, kind: "site", since: "2026", anchor: "#site-tanya-bunina", group: "sites" },
  { id: "me4tut",      name: { ru: "Мечта Тут", en: "Mechta Tut" },                       kind: "site", since: "2026", anchor: "#site-mechta-tut",  group: "sites" },
];

/* Рёбра: пара id. Каждое ребро отвечает на вопрос «что общего у этих двух». */
export const liveEdges: [string, string][] = [
  /* внутри торговли: поток данных → исполнение → котирование; ресёрч → калибровка → котирование */
  ["t-backbone", "t-exec"],
  ["t-exec", "t-mm"],
  ["t-mm", "trading"],
  ["t-research", "t-calib"],
  ["t-calib", "t-mm"],
  ["t-backbone", "trading"],
  /* продукты продаются или показываются через витрину */
  ["qwerty", "store"],
  ["living-canvas", "store"],
  ["content-factory", "store"],
  ["site-check", "store"],
  /* два клиентских сайта правятся одним и тем же редактором */
  ["horsesfarm", "tanyabunina"],
  /* витрина ведёт на клиентские работы */
  ["store", "me4tut"],
  ["store", "horsesfarm"],
];

/* Что считаем «системой в проде» для hero-статистики: всё, что работает само,
   включая продукт и инструменты; подсистемы торговли входят в один хаб, сайты
   считаются отдельно. */
export const liveSystems = liveNodes.filter((n) => n.kind === "system" || n.kind === "product" || n.kind === "tool");
export const liveSites = liveNodes.filter((n) => n.kind === "site");
