export type Lang = "ru" | "en";

/* Static UI strings. RU keeps the typographic dash (—) sparingly.
   EN never uses an em-dash (design rule): hyphen only. Content lives in /data. */
export const UI = {
  ru: {
    /* header: only what a visitor needs to get around; lab/proof are pages, not anchors */
    nav: {
      works: "Работы", lab: "Лаборатория", proof: "Доказательства", method: "Как я работаю", contact: "Связь",
      websites: "Сайты", films: "Ролики", releases: "Хроника",
    },
    nav_hire: "Заказать",
    nav_store: "Магазин",
    nav_cta: "Связаться",

    hero_eyebrow: "АЛЕКСАНДР ШУЛЬГИН · ИНЖЕНЕР · GMT+10 · ОТКРЫТ К НАЙМУ И ЗАКАЗАМ",
    hero_l1: "Строю системы,",
    hero_l2: "которые работают",
    hero_l3: "без меня",
    hero_lede: "Боты, автоматизация, сайты, ИИ-агенты. Один, весь путь: от задачи словами до продакшна 24/7. Четыре формализации приняты в репозиторий Google DeepMind, парк систем работает без присмотра, и у каждой цифры ниже есть источник.",
    hero_cta1: "Работы и доказательства",
    hero_cta2: "Нужен сайт или бот",

    /* three proof cards under the hero buttons; the third one is market-specific */
    hc1_n: "13", hc1_t: "живых механик в лаборатории", hc1_href: "/lab/",
    hc2_n: "4", hc2_t: "PR приняты в репозиторий DeepMind", hc2_href: "/proof/",
    hc3_n: "17★", hc3_t: "open-source харнесс для Claude Code", hc3_href: "/curated-claude-code/",

    proof: { uptime: "Без оператора", prodsys: "Систем в проде", latency: "Ускорение отправки", trades: "Сделок проанализировано" },
    prov: {
      uptime: "торговая инфраструктура, с 2025",
      prodsys: "карта выше и список в «Работах»",
      latency: "отправка ордера: 290–596 → 18–41 мс, 03.2026",
      trades: "6 249 кошельков, контур ресёрча",
    },

    scene_label: "Карта живых систем",
    scene_hint: "наведите на узел, кликните, чтобы перейти",
    node_kind: { system: "в проде", sub: "подсистема", site: "живой сайт", product: "продукт", tool: "инструмент" },

    w_badge: "§02 / Работы",
    w_h2: "Что построено",
    w_right: "ПРОД · ОТКРЫТЫЙ КОД · КЛИЕНТЫ",
    w_more: "Остальные работы",
    w_group_open: "Продукты, инструменты, открытый код",
    w_group_client: "Клиентские",
    w_group_closed: "Снятые с эксплуатации",
    w_stack: "Стек, через работы",
    w_stack_hint: "нажмите на технологию: откроются работы, где она применена",
    w_open: "открыть",

    flag_kicker: "Флагман 2 · торговля",
    flag_title: "Маркет-мейкинг система: Polymarket + Kalshi",
    flag_lede: "Торговая инфраструктура на двух биржах в штатном режиме без оператора: котирование ликвидности, казначейство, позиции и риск, алерты и ручной стоп. Своя low-latency инфраструктура и контур ресёрча, весь стек на мне.",
    flag_subs: "Подсистемы",
    flag_prov: "Цифры: собственные замеры на своей инфраструктуре, 2025–2026. Методы закрыты намеренно.",

    fmath_kicker: "Флагман 1 · формальная математика",
    fmath_title: "Доказательства и эволюционный поиск",
    fmath_lede: "Машинно-проверяемые формализации известных результатов по задачам Эрдёша и Грина в Lean 4, принятые в открытый репозиторий Google DeepMind formal-conjectures после ревью его мейнтейнеров. Корректность каждого результата проверена ядром Lean: 0 sorry, чистые аксиомы. Рядом эволюционный поиск, который воспроизвёл известную SOTA-границу. ∎",
    fmath_subs: "Вклады",
    fmath_prov: "Каждая карточка ведёт на PR или репозиторий: проверяется за минуту.",

    web_badge: "§03 / Сайты",
    web_h2: "Сделанные сайты",
    web_right: "С ПРЕВЬЮ",
    web_open: "открыть сайт",

    lab_badge: "§04 / Лаборатория",
    lab_h2: "Живые механики",
    lab_right: "13 ПРИЁМОВ · ОТКРЫТЫЙ КОД",
    lab_lede: "Три из тринадцати. Каждая работает прямо здесь, у каждой свой адрес и исходник.",
    lab_all: "Вся лаборатория",
    lab_open: "открыть",
    lab_src: "исходник",

    film_badge: "§05 / Ролики",
    film_h2: "Ролики, собранные кодом",
    film_right: "HTML → MP4",
    film_more: "Показать все",
    film_less: "Свернуть",

    p2_badge: "§06 / Метод",
    p2_h2: "Как я работаю",
    p2_right: "ЧЕТЫРЕ ПРАВИЛА",

    r5_badge: "§07 / Хроника",
    r5_h2: "Что отгружено",
    r5_right: "С ДАТАМИ, БЕЗ ОБЕЩАНИЙ",

    c6_badge: "§08 / Связь",
    c6_h2: "Давайте работать",
    c6_right: "ОТВЕЧАЮ ЗА СУТКИ",
    c_lead_p: "Ищу задачи, где нельзя нагуглить ответ, и команду, которая это ценит: AI/LLM-инженерия, Python-бэкенд, боты и автоматизация, web3-данные, плюс дизайн и вёрстка. Незнакомое осваиваю быстро и довожу до прода.",
    c_biz: "Заказы для бизнеса веду постоянно: сайты, боты, интеграции. Простым языком, с договором и чеком.",
    c_biz_btn: "Описать задачу",
    cm: {
      format_h: "Формат", format_v: "Full-time · контракт · фриланс", format_p: "Удалённо или офис. Готов к релокации: EU, Азия, ОАЭ.",
      focus_h: "Задачи", focus_v: "AI / Backend / Automation", focus_p: "Python-бэкенд, LLM-интеграции и агенты, боты и автоматизация, crypto/web3-данные, сайты.",
      lang_h: "Языки", lang_v: "RU · EN", lang_p: "Русский родной. Английский: документация, код и переписка свободно, к звонку-проверке готов.",
    },

    status: { prod: "В ПРОДЕ", research: "RESEARCH", client: "КЛИЕНТСКИЙ", saas: "SAAS", open: "ОТКРЫТЫЙ КОД", pet: "PET-PROJECT", closed: "СНЯТ" },

    foot: "© 2026 Александр Шульгин",
    foot_link: "напишите →",
    foot_nav: { store: "Магазин", lab: "Лаборатория", proof: "Доказательства", check: "Проверка сайта", llms: "Для ИИ-агентов", privacy: "Приватность", src: "Исходник сайта" },
    coda_tag: "ASCII · РЕНДЕР В РЕАЛЬНОМ ВРЕМЕНИ",
    sticky_hire: "Заказать",
  },

  en: {
    nav: {
      works: "Work", lab: "Lab", proof: "Evidence", method: "How I work", contact: "Contact",
      websites: "Sites", films: "Films", releases: "Timeline",
    },
    nav_hire: "Services",
    nav_store: "Store",
    nav_cta: "Get in touch",

    hero_eyebrow: "ALEKSANDR SHULGIN · ENGINEER · GMT+10 · OPEN TO HIRE AND ORDERS",
    hero_l1: "I build systems",
    hero_l2: "that keep running",
    hero_l3: "without me",
    hero_lede: "Bots, automation, websites, AI agents. One person, the whole path: from a task in words to 24/7 production. Four formalizations accepted into Google DeepMind's repository, a fleet of systems running unattended, and a source behind every number below.",
    hero_cta1: "Work and evidence",
    hero_cta2: "I need a site or a bot",

    hc1_n: "13", hc1_t: "live mechanics in the lab", hc1_href: "/lab/",
    hc2_n: "4", hc2_t: "PRs merged into DeepMind's repository", hc2_href: "/proof/",
    hc3_n: "17★", hc3_t: "open-source Claude Code harness", hc3_href: "/curated-claude-code/",

    proof: { uptime: "Unattended", prodsys: "Systems in prod", latency: "Order submit speed-up", trades: "Trades analyzed" },
    prov: {
      uptime: "trading infrastructure, since 2025",
      prodsys: "the map above and the Work list",
      latency: "order submit: 290-596 to 18-41 ms, Mar 2026",
      trades: "6,249 wallets, research loop",
    },

    scene_label: "Map of live systems",
    scene_hint: "hover a node, click to jump to it",
    node_kind: { system: "in prod", sub: "subsystem", site: "live site", product: "product", tool: "tool" },

    w_badge: "§02 / Work",
    w_h2: "What I've built",
    w_right: "PROD · OPEN SOURCE · CLIENTS",
    w_more: "More work",
    w_group_open: "Products, tools, open source",
    w_group_client: "Client work",
    w_group_closed: "Retired",
    w_stack: "Stack, through the work",
    w_stack_hint: "click a technology to open the work where it is used",
    w_open: "open",

    flag_kicker: "Flagship 2 · trading",
    flag_title: "Market-Making System: Polymarket + Kalshi",
    flag_lede: "Trading infrastructure on two exchanges, running unattended in normal operation: liquidity quoting, treasury, positions and risk, alerts and a manual stop. Custom low-latency infrastructure and a research loop, the whole stack on me.",
    flag_subs: "Subsystems",
    flag_prov: "Numbers: my own measurements on my own infrastructure, 2025-2026. Methods are closed on purpose.",

    fmath_kicker: "Flagship 1 · formal mathematics",
    fmath_title: "Proofs and evolutionary search",
    fmath_lede: "Machine-checked Lean 4 formalizations of known results on Erdos and Green problems, accepted into Google DeepMind's open formal-conjectures repository after review by its maintainers. Every result is checked by the Lean kernel: 0 sorry, clean axioms. Next to it, an evolutionary search that reproduced the known SOTA bound. ∎",
    fmath_subs: "Contributions",
    fmath_prov: "Every card links to the PR or the repository: verifiable in a minute.",

    web_badge: "§03 / Sites",
    web_h2: "Sites I've shipped",
    web_right: "WITH PREVIEWS",
    web_open: "open the site",

    lab_badge: "§04 / Lab",
    lab_h2: "Live mechanics",
    lab_right: "13 TECHNIQUES · OPEN SOURCE",
    lab_lede: "Three of thirteen. Each one runs right here, each has its own address and source.",
    lab_all: "The whole lab",
    lab_open: "open",
    lab_src: "source",

    film_badge: "§05 / Films",
    film_h2: "Films rendered from code",
    film_right: "HTML → MP4",
    film_more: "Show all",
    film_less: "Show fewer",

    p2_badge: "§06 / Method",
    p2_h2: "How I work",
    p2_right: "FOUR RULES",

    r5_badge: "§07 / Timeline",
    r5_h2: "What I've shipped",
    r5_right: "DATED, NOT PROMISED",

    c6_badge: "§08 / Contact",
    c6_h2: "Let's work together",
    c6_right: "REPLY WITHIN A DAY",
    c_lead_p: "Looking for problems you can't just google, and a team that values that: AI/LLM engineering, Python backend, bots and automation, web3 data, plus design and front-end. I pick up the unfamiliar fast and ship it.",
    c_biz: "Business orders are always open: websites, bots, integrations. Plain language, a contract and a receipt.",
    c_biz_btn: "Describe a task",
    cm: {
      format_h: "Format", format_v: "Full-time · contract · freelance", format_p: "Remote or on-site. Open to relocation: EU, Asia, UAE.",
      focus_h: "Focus", focus_v: "AI / Backend / Automation", focus_p: "Python backend, LLM integrations and agents, bots and automation, crypto/web3 data, websites.",
      lang_h: "Languages", lang_v: "RU · EN", lang_p: "Native Russian. English: docs, code and written communication with ease; happy to do a screening call.",
    },

    status: { prod: "PRODUCTION", research: "RESEARCH", client: "CLIENT", saas: "SAAS", open: "OPEN SOURCE", pet: "PET-PROJECT", closed: "RETIRED" },

    foot: "© 2026 Aleksandr Shulgin",
    foot_link: "get in touch →",
    foot_nav: { store: "Store", lab: "Lab", proof: "Evidence", check: "Site check", llms: "For AI agents", privacy: "Privacy", src: "Site source" },
    coda_tag: "ASCII · REAL-TIME RENDER",
    sticky_hire: "Services",
  },
};

export const META = {
  ru: {
    title: "Александр Шульгин — инженер: боты, автоматизация, сайты, ИИ-агенты",
    desc: "Александр Шульгин, инженер полного цикла. Четыре формализации приняты в репозиторий Google DeepMind, торговая инфраструктура без оператора, продукты и клиентские сайты. Открыт к найму и заказам.",
    ogt: "Александр Шульгин — строю системы, которые работают без меня",
    ogd: "Боты, автоматизация, сайты, ИИ-агенты. 4 PR в DeepMind, 13 живых механик, только проверяемые ссылки.",
    locale: "ru_RU",
  },
  en: {
    title: "Aleksandr Shulgin - engineer: bots, automation, websites, AI agents",
    desc: "Aleksandr Shulgin, full-cycle engineer. Four formalizations accepted into Google DeepMind's repository, unattended trading infrastructure, products and client sites. Open to hiring and orders.",
    ogt: "Aleksandr Shulgin - I build systems that keep running without me",
    ogd: "Bots, automation, websites, AI agents. 4 PRs in DeepMind, 13 live mechanics, verifiable links only.",
    locale: "en_US",
  },
} as const;
