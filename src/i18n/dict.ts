export type Lang = "ru" | "en";

/* Static UI strings. RU keeps correct typographic dash (—).
   EN avoids em-dash by design-skill rule. Project/release content lives in /data. */
export const UI = {
  ru: {
    nav: { intro: "Манифест", principles: "Принципы", projects: "Проекты", apps: "Приложения", stack: "Стек", releases: "Релизы", contact: "Связь" },
    nav_cta: "Связаться",

    hero_eyebrow: "PORTFOLIO 2026 / GMT+10 / BACKEND / PYTHON / LLM",
    hero_l1: "Код",
    hero_l2: "под любую",
    hero_l3: "задачу",
    hero_lede: "Беру задачу словами — отдаю систему, которая работает без меня. Один, весь путь: код, инфраструктура, продакшн 24/7.",
    hero_sub: "Backend · Automation · LLM · Web3 · trading-инфраструктура.",
    hero_cta1: "Смотреть проекты",
    hero_cta2: "Как я работаю",

    proof: { uptime: "Аптайм", prodsys: "Систем в проде", latency: "Прирост латентности", trades: "Сделок проанализировано" },

    p2_badge: "§02 / Принципы",
    p2_h2: "Как я работаю",
    p2_right: "ЧЕТЫРЕ ПРАВИЛА",

    p3_badge: "§03 / Проекты",
    p3_h2: "Что я построил",
    p3_right: "ALL SHIPPED",
    flag_kicker: "Флагман",
    flag_title: "Маркет-мейкинг система на Polymarket",
    flag_lede: "Не бот, а торговая операция, которая живёт сама: котирую ликвидность, веду казначейство, держу позиции и риск 24/7. Своя low-latency инфраструктура и контур ресёрча — весь стек на мне.",
    flag_subs: "Подсистемы",
    flag_more: "Остальные проекты",
    fmath_kicker: "Формальная математика",
    fmath_title: "Доказательства и эволюционный поиск",
    fmath_lede: "Машинно-проверяемые доказательства в Lean 4 и эволюционный LLM-поиск на открытых задачах Эрдёша. Вклад в открытый репозиторий Google DeepMind — от комбинаторики до теории чисел, каждое доказательство проверено ядром Lean.",
    fmath_subs: "Вклады",

    a_badge: "§04 / Приложения",
    a_h2: "Десктоп и игры",
    a_right: "DESKTOP · GAME · OSS",

    s4_badge: "§05 / Стек",
    s4_h2: "Чем работаю каждый день",
    s4_right: "ВСЁ В РАБОТЕ",
    s4_leg_core: "ядро / профильное",
    s4_leg_use: "в рабочем арсенале",

    r5_badge: "§06 / Релиз-ноты",
    r5_h2: "Что я отгружал",
    r5_right: "SHIPPED, NOT PROMISED",

    c6_badge: "§07 / Связь",
    c6_h2: "Давайте работать",
    c6_right: "ОТВЕЧАЮ ЗА СУТКИ",
    c_lead_h3: "Дочитал? Напиши",
    c_lead_p: "Ищу задачи, где нельзя нагуглить ответ, и команду, которая это ценит. Python / automation / LLM / web3 / trading-инфра, плюс дизайн и вёрстка сайтов и приложений. Деньги важны, но смысл важнее. Незнакомое осваиваю быстро и довожу до прода.",
    c_arrow: "Контакты →",
    cm: {
      format_h: "Формат", format_v: "Full-time", format_p: "Удалёнка или офис. Готов к релокации в адекватные локации: EU, Asia, ОАЭ.",
      focus_h: "Задачи", focus_v: "Backend / Auto / LLM", focus_p: "Python-бэкенд, automation, LLM-интеграции, crypto/web3, trading-инфра, скрейпинг в проде.",
      lang_h: "Языки", lang_v: "RU · EN", lang_p: "Русский родной. Английский: читаю доку и код, веду переписку. Speaking подтяну в процессе.",
    },
    foot: "© 2026 Александр Шульгин",
    foot_link: "напишите →",
    coda_tag: "ASCII · РЕНДЕР В РЕАЛЬНОМ ВРЕМЕНИ",
  },

  en: {
    nav: { intro: "Manifesto", principles: "Principles", projects: "Projects", apps: "Apps", stack: "Stack", releases: "Releases", contact: "Contact" },
    nav_cta: "Get in touch",

    hero_eyebrow: "PORTFOLIO 2026 / GMT+10 / BACKEND / PYTHON / LLM",
    hero_l1: "Code",
    hero_l2: "for any",
    hero_l3: "task",
    hero_lede: "I take a task in words and hand back a system that runs without me. One person, the whole path: code, infrastructure, 24/7 production.",
    hero_sub: "Backend · Automation · LLM · Web3 · trading infrastructure.",
    hero_cta1: "View projects",
    hero_cta2: "How I work",

    proof: { uptime: "Uptime", prodsys: "Systems in prod", latency: "Latency uplift", trades: "Trades analyzed" },

    p2_badge: "§02 / Principles",
    p2_h2: "How I work",
    p2_right: "FOUR RULES",

    p3_badge: "§03 / Projects",
    p3_h2: "What I've built",
    p3_right: "ALL SHIPPED",
    flag_kicker: "Flagship",
    flag_title: "Polymarket Market-Making System",
    flag_lede: "Not a bot but a trading operation that runs itself: I quote liquidity, run a treasury, hold positions and risk 24/7. Custom low-latency infrastructure and a research loop, the whole stack on me.",
    flag_subs: "Subsystems",
    flag_more: "Other projects",
    fmath_kicker: "Formal mathematics",
    fmath_title: "Proofs and evolutionary search",
    fmath_lede: "Machine-verified Lean 4 proofs and evolutionary LLM search on open Erdos problems. A contribution to Google DeepMind's open repo, from combinatorics to number theory, every proof checked by the Lean kernel.",
    fmath_subs: "Contributions",

    a_badge: "§04 / Apps",
    a_h2: "Desktop and games",
    a_right: "DESKTOP · GAME · OSS",

    s4_badge: "§05 / Stack",
    s4_h2: "What I use every day",
    s4_right: "ALL IN USE",
    s4_leg_core: "core / primary",
    s4_leg_use: "in active use",

    r5_badge: "§06 / Release notes",
    r5_h2: "What I've shipped",
    r5_right: "SHIPPED, NOT PROMISED",

    c6_badge: "§07 / Contact",
    c6_h2: "Let's work together",
    c6_right: "REPLY WITHIN A DAY",
    c_lead_h3: "Read this far? Reach out",
    c_lead_p: "Looking for problems you can't just google, and a team that values that. Python / automation / LLM / web3 / trading infra, plus design and front-end for sites and apps. Money matters, but meaning matters more. I pick up the unfamiliar fast and ship it.",
    c_arrow: "Contacts →",
    cm: {
      format_h: "Format", format_v: "Full-time", format_p: "Remote or on-site. Open to relocation to sensible locations: EU, Asia, UAE.",
      focus_h: "Focus", focus_v: "Backend / Auto / LLM", focus_p: "Python backend, automation, LLM integrations, crypto/web3, trading infra, production-grade scraping.",
      lang_h: "Languages", lang_v: "RU · EN", lang_p: "Russian is native. English: I read docs and code and handle written communication. Speaking is a work in progress.",
    },
    foot: "© 2026 Aleksandr Shulgin",
    foot_link: "get in touch →",
    coda_tag: "ASCII · REAL-TIME RENDER",
  },
};

export const META = {
  ru: {
    title: "IShu — Код под любую задачу. | Backend / Python / LLM",
    desc: "Александр Шульгин — инженер полного цикла. Маркет-мейкинг система на Polymarket, async Python, Rust, LLM-пайплайны, вклад в Google DeepMind. Открыт к предложениям.",
    ogt: "IShu — Код под любую задачу.",
    ogd: "Инженер полного цикла. Маркет-мейкинг на Polymarket, Rust hot path, LLM, вклад в DeepMind. Открыт к предложениям.",
    locale: "ru_RU",
  },
  en: {
    title: "IShu — Code for any task. | Backend / Python / LLM",
    desc: "Aleksandr Shulgin — full-cycle engineer. A Polymarket market-making system, async Python, Rust, LLM pipelines, a Google DeepMind contribution. Open to offers.",
    ogt: "IShu — Code for any task.",
    ogd: "Full-cycle engineer. Polymarket market-making, Rust hot path, LLM, a DeepMind contribution. Open to offers.",
    locale: "en_US",
  },
} as const;
