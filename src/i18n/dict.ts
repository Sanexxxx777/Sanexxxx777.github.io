export type Lang = "ru" | "en";

/* /proof/ is two built pages, language = URL (scripts/static-lang.mjs); /hire/ and /cv/ take ?lang= */
export const proofHref = (lang: Lang) => (lang === "ru" ? "/ru/proof/" : "/proof/");

/* Static UI strings. RU keeps the typographic dash (—) sparingly.
   EN never uses an em-dash (design rule): hyphen only. Content lives in /data. */
export const UI = {
  ru: {
    /* header: only what a visitor needs to get around; lab/proof are pages, not anchors */
    nav: {
      home: "Главная", works: "Работы", proof: "Открытый код", cv: "Резюме", game: "Игра", method: "Как я работаю", contact: "Связь",
      websites: "Сайты", films: "Ролики", releases: "Хроника",
    },
    nav_hire: "Заказать",
    nav_store: "Магазин",
    nav_cta: "Связаться",

    hero_eyebrow: "ИНЖЕНЕР: ИИ И БЭКЕНД · GMT+10 · ОТКРЫТ К НАЙМУ И ЗАКАЗАМ",
    hero_name: "Александр Шульгин",
    hero_l1: "Код",
    hero_l2: "под любую",
    hero_l3: "задачу",
    hero_lede: "Беру задачу словами и отдаю систему, которая работает без меня: боты, автоматизация, ИИ-агенты, торговые системы.",
    hero_cta1: "Смотреть работы",
    hero_cta2: "Обсудить задачу",
    /* Stonewake: tile in the Live experiments strip (strings restored from b28a6e5) */
    game_beta: "бета",
    game_title: "Stonewake",
    game_txt: "Портфолио в виде игры: каменный голем будит остров, а по дороге находятся мои проекты.",
    game_go: "Играть",
    game_alt: "Спящий остров Stonewake над облаками",

    /* proof row under the hero buttons: card 1 = hc2, card 2 = liveSystems.length + hero_sys_t (card 3 «2 references» removed 24.11) */
    hc2_n: "7", hc2_t: "PR приняты в репозиторий DeepMind", hc2_href: proofHref("ru"),
    hero_sys_t: "систем и инструментов в работе",
    hero_contact_aria: "Контакты",
    /* primary CTA opens a Telegram chat with this text prefilled (konsilium 24.11: conversation, not another page) */
    hero_tg_text: "Здравствуйте, Александр! Задача: ",
    hero_cta_hint: "Пишете в Telegram своими словами, цену и срок называю за день.",
    /* handover card next to the headline: one delivered site + the owner's words (verbatim excerpt of websites.ts quote) */
    hcase_label: "Сдано · антикафе «Мечта Тут», Петербург",
    hcase_quote: "«Вот теперь идеальный сайт, реально. Сто из десяти.»",
    hcase_by: "Василий, владелец",
    hcase_did: "Залы с калькулятором аренды, цены и анонсы владелец меняет сам.",
    hcase_all: "Все сданные сайты",

    /* door band under the hero: three entrances by visitor intent; hrefs carry ?lang (static pages keep their own storage) */
    doors_h: "С чем вы пришли",
    doors: [
      { lbl: "Найм", title: "Ищу инженера в команду", line: "Роли AI/LLM и Python-бэкенд, удалённо или с переездом. Короткое резюме.", href: "/cv/?lang=ru", cta: "door-cv" },
      { lbl: "Разработка", title: "Нужна разработка под задачу", line: "Боты, интеграции, ИИ в работе, бэкенд. Цена и срок до старта.", href: "/hire/?lang=ru", cta: "door-hire" },
      { lbl: "Малый бизнес", title: "Сайт или бот для своего дела", line: "Для небольшого бизнеса: простым языком, с ориентирами по цене.", href: "/store/prosto/", cta: "door-biz" },
    ],
    tao_link: "комментарий Тао",

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
    w_open: "открыть",

    flag_kicker: "Флагман · торговая инфраструктура",
    flag_title: "Маркет-мейкинг на биржах предсказаний",
    flag_lede: "Торговая инфраструктура на двух биржах в штатном режиме без оператора: котирование ликвидности, казначейство, позиции и риск, алерты и ручной стоп. Своя low-latency инфраструктура и контур ресёрча, весь стек на мне.",
    flag_subs: "Подсистемы",
    flag_prov: "Отправка заявки 290–596 → 18–41 мс, март 2026. Цифры: собственные замеры на своей инфраструктуре, 2025–2026. Методы закрыты намеренно.",

    fmath_kicker: "Google DeepMind · formal-conjectures",
    fmath_title: "Мой код принят в репозиторий Google DeepMind",
    fmath_lede: "Шесть формализаций по задачам Эрдёша, Грина и Капланского написаны на Lean 4, прошли ревью мейнтейнеров Google DeepMind и вошли в их открытый репозиторий formal-conjectures; ещё один вмёрженный PR ссылается на чужое доказательство, всего семь. Формальные доказательства проверяет ядро Lean: 0 sorry, чистые аксиомы. Рядом эволюционный поиск, повторивший численную границу уровня AlphaEvolve. ∎",
    fmath_subs: "Вклады",
    fmath_prov: "Каждая карточка ведёт на PR или репозиторий: проверяется за минуту.",

    web_badge: "§03 / Сайты",
    web_h2: "Сделанные сайты",
    web_right: "С ПРЕВЬЮ",
    web_open: "открыть сайт",
    web_quotes_h: "Что говорят заказчики",
    web_quotes_note: "Из сообщений в Telegram после сдачи, дословно, с сокращениями.",

    ghost_cap: "Living Canvas, мой движок. Ткни.",
    /* §05: the wow site with the flooding effect (Sasha: never call it a toy); numbers must match what the Worker ships */
    flood_badge: "§05 / Вау-сайт",
    flood_h2: "Затопи любой сайт",
    flood_right: "ТЕЛЕФОН · БРАУЗЕР · БЕСПЛАТНО",
    flood_lede: "Вводишь адрес любого сайта, держишь палец, и страница уходит под воду: заголовки отклеиваются и плавают, картинки тонут, наклон телефона качает всё это. Картинку с результатом можно отправить кому угодно.",
    flood_f1: "Сайт рисует настоящий браузер в изолированной сети Cloudflare, наши серверы не участвуют",
    flood_f2: "Физика Matter.js: плавучесть по трём точкам, волны на пружинах, 60 кадров в секунду на телефоне",
    flood_f3: "Один вечер от идеи до живой ссылки: Cloudflare Worker, KV-кэш уровней, 32 автоматических теста",
    flood_open: "Затопить сайт",
    flood_alt: "Два телефона: сайт до затопления и наполовину под водой",

    film_badge: "§06 / Ролики",
    film_h2: "Ролики, собранные кодом",
    film_right: "HTML → MP4",
    film_more: "Показать все",
    film_less: "Свернуть",
    list_more: "Показать все",
    list_less: "Свернуть",

    p2_badge: "§07 / Метод",
    p2_h2: "Как я работаю",
    p2_right: "ЧЕТЫРЕ ПРАВИЛА",

    r5_badge: "§08 / Хроника",
    r5_h2: "Что отгружено",
    r5_right: "С ДАТАМИ, БЕЗ ОБЕЩАНИЙ",

    c6_badge: "§09 / Связь",
    c6_h2: "Давайте работать",
    c6_right: "ОТВЕЧАЮ ЗА СУТКИ",
    exp_badge: "§06 / Эксперименты",
    exp_h2: "Живые эксперименты",
    exp_alt_films: "Кадр ролика, собранного кодом",
    c_reply: "Отвечаю в течение дня.",
    c_lead_p: "Открыт к ролям AI/LLM и Python-бэкенд. Около двух лет практики: свои продукты в проде, торговые системы и работа для заказчиков. Незнакомое осваиваю быстро и довожу до прода.",
    c_biz: "Заказы для бизнеса веду постоянно: сайты, боты, интеграции. Простым языком, с договором и чеком.",
    c_biz_btn: "Описать задачу",
    c_tg_btn: "Написать в Telegram",
    cm: {
      format_h: "Формат", format_v: "Full-time · контракт · фриланс", format_p: "Удалённо или офис. Готов к релокации: EU, Азия, ОАЭ.",
      focus_h: "Задачи", focus_v: "AI / Backend / Automation", focus_p: "Python-бэкенд, LLM-интеграции и агенты, боты и автоматизация, crypto/web3-данные, сайты.",
      lang_h: "Языки", lang_v: "RU · EN", lang_p: "Русский родной. Английский: документация, код и переписка свободно, к звонку-проверке готов.",
    },

    status: { prod: "В ПРОДЕ", research: "RESEARCH", client: "КЛИЕНТСКИЙ", saas: "SAAS", open: "ОТКРЫТЫЙ КОД", pet: "PET-PROJECT", closed: "СНЯТ" },

    foot: "© 2026 Александр Шульгин",
    foot_link: "напишите →",
    foot_nav: { store: "Магазин", proof: "Открытый код", cv: "Резюме", check: "Проверка сайта", llms: "Для ИИ-агентов", privacy: "Политика конфиденциальности", src: "Исходник сайта" },
    coda_tag: "ASCII · РЕНДЕР В РЕАЛЬНОМ ВРЕМЕНИ",
    sticky_hire: "Заказать",
  },

  en: {
    nav: {
      home: "Home", works: "Work", proof: "Open source", cv: "CV", game: "Game", method: "How I work", contact: "Contact",
      websites: "Sites", films: "Films", releases: "Timeline",
    },
    nav_hire: "Start a project",
    nav_store: "Store",
    nav_cta: "Get in touch",

    hero_eyebrow: "AI & BACKEND ENGINEER · GMT+10 · AVAILABLE FOR ROLES AND PROJECTS",
    hero_name: "Aleksandr Shulgin",
    hero_l1: "Code",
    hero_l2: "for any",
    hero_l3: "task",
    hero_lede: "Describe what you need in plain words and get back a system that runs without me: bots, automation, AI agents, trading systems.",
    hero_cta1: "View work",
    hero_cta2: "Discuss a project",
    game_beta: "beta",
    game_title: "Stonewake",
    game_txt: "My portfolio as a game: a stone golem wakes an island and finds my projects along the way.",
    game_go: "Play",
    game_alt: "The sleeping island of Stonewake above the clouds",
    hc2_n: "7", hc2_t: "PRs merged into DeepMind's repository", hc2_href: proofHref("en"),
    hero_sys_t: "live systems and tools",
    hero_contact_aria: "Contact",
    hero_tg_text: "Hi Aleksandr! My task: ",
    hero_cta_hint: "Write in Telegram in plain words, and you get a price and timeline within a day.",
    hcase_label: "Delivered · Mechta Tut anticafe, Saint Petersburg",
    hcase_quote: "\u201cNow this is the perfect site, really. A hundred out of ten.\u201d",
    hcase_by: "Vasily, owner",
    hcase_did: "Event rooms with a rental calculator; the owner changes prices and announcements himself.",
    hcase_all: "All delivered sites",

    doors_h: "What brings you here",
    doors: [
      { lbl: "Hiring", title: "Hiring an engineer", line: "AI/LLM and Python backend roles, remote or relocation. A short CV.", href: "/cv/?lang=en", cta: "door-cv" },
      { lbl: "Development", title: "Need custom software", line: "Bots, integrations, AI in your workflow, backend. Price and deadline before we start.", href: "/hire/?lang=en", cta: "door-hire" },
      { lbl: "Small business", title: "A site or a bot for a small business", line: "In plain words, with price ranges.", href: "/store/prosto/en/", cta: "door-biz" },
    ],
    tao_link: "Tao's comment",

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
    w_open: "open",

    flag_kicker: "Flagship · trading infrastructure",
    flag_title: "Market-Making on Prediction Markets",
    flag_lede: "Trading infrastructure on two exchanges, running unattended in normal operation: liquidity quoting, treasury, positions and risk, alerts and a manual stop. Custom low-latency infrastructure and a research loop, the whole stack on me.",
    flag_subs: "Subsystems",
    flag_prov: "Order submit 290-596 → 18-41 ms, March 2026. Numbers: my own measurements on my own infrastructure, 2025-2026. Methods are closed on purpose.",

    fmath_kicker: "Google DeepMind · formal-conjectures",
    fmath_title: "My code is in Google DeepMind's repository",
    fmath_lede: "Six formalizations of Erdos, Green and Kaplansky problems written in Lean 4, reviewed by Google DeepMind maintainers and merged into their open formal-conjectures repository; one more merged PR links an external proof, seven in total. Lean checks the formal proofs: 0 sorry, clean axioms. Next to it, an evolutionary search that reproduced a numerical bound at AlphaEvolve level. ∎",
    fmath_subs: "Contributions",
    fmath_prov: "Every card links to the PR or the repository: verifiable in a minute.",

    web_badge: "§03 / Sites",
    web_h2: "Sites I've shipped",
    web_right: "WITH PREVIEWS",
    web_open: "open the site",
    web_quotes_h: "What clients say",
    web_quotes_note: "Translated excerpts from clients' Telegram messages after handover.",

    ghost_cap: "Living Canvas, my engine. Poke it.",
    /* §05: the wow site with the flooding effect (Sasha: never call it a toy); numbers must match what the Worker ships */
    flood_badge: "§05 / Wow site",
    flood_h2: "Flood any website",
    flood_right: "PHONE · BROWSER · FREE",
    flood_lede: "Type any website's address, hold your finger, and the page goes under water: headings come loose and float, images sink, tilting the phone rocks it all. Share the picture with anyone.",
    flood_f1: "A real browser renders the site inside Cloudflare's isolated network; none of my servers are involved",
    flood_f2: "Matter.js physics: three-point buoyancy, spring-line waves, 60 fps on a phone",
    flood_f3: "One evening from idea to live link: Cloudflare Worker, a KV cache of levels, 32 automated tests",
    flood_open: "Flood a site",
    flood_alt: "Two phones: a site before the flood and half under water",

    film_badge: "§06 / Films",
    film_h2: "Films rendered from code",
    film_right: "HTML → MP4",
    film_more: "Show all",
    film_less: "Show fewer",
    list_more: "Show all",
    list_less: "Show fewer",

    p2_badge: "§07 / Method",
    p2_h2: "How I work",
    p2_right: "FOUR RULES",

    r5_badge: "§08 / Timeline",
    r5_h2: "What I've shipped",
    r5_right: "DATED, NOT PROMISED",

    c6_badge: "§09 / Contact",
    c6_h2: "Let's work together",
    c6_right: "REPLY WITHIN A DAY",
    exp_badge: "§06 / Experiments",
    exp_h2: "Live experiments",
    exp_alt_films: "A frame from a film rendered from code",
    c_reply: "Reply within a day.",
    c_lead_p: "Open to AI/LLM and Python backend roles. About two years of hands-on work: my own products in production, trading systems and client projects. I pick up the unfamiliar fast and ship it.",
    c_biz: "Business orders are always open: websites, bots, integrations. Plain language, a contract and a receipt.",
    c_biz_btn: "Describe a task",
    c_tg_btn: "Write on Telegram",
    cm: {
      format_h: "Format", format_v: "Full-time · contract · freelance", format_p: "Remote or on-site. Open to relocation: EU, Asia, UAE.",
      focus_h: "Focus", focus_v: "AI / Backend / Automation", focus_p: "Python backend, LLM integrations and agents, bots and automation, crypto/web3 data, websites.",
      lang_h: "Languages", lang_v: "RU · EN", lang_p: "Native Russian. English: docs, code and written communication with ease; happy to do a screening call.",
    },

    status: { prod: "PRODUCTION", research: "RESEARCH", client: "CLIENT", saas: "SAAS", open: "OPEN SOURCE", pet: "PET-PROJECT", closed: "RETIRED" },

    foot: "© 2026 Aleksandr Shulgin",
    foot_link: "get in touch →",
    foot_nav: { store: "Store", proof: "Open source", cv: "CV", check: "Site check", llms: "For AI agents", privacy: "Privacy policy", src: "Site source" },
    coda_tag: "ASCII · REAL-TIME RENDER",
    sticky_hire: "Start a project",
  },
};

export const META = {
  ru: {
    title: "Александр Шульгин — ИИ и бэкенд-инженер",
    desc: "ИИ и бэкенд-инженер: боты, автоматизация, ИИ-агенты, торговые системы. 7 пул-реквестов приняты в Google DeepMind, 8 систем работают без присмотра.",
    ogt: "Александр Шульгин — код под любую задачу",
    ogd: "Боты, автоматизация, ИИ-агенты, торговые системы. 7 PR приняты в Google DeepMind, 8 систем работают без присмотра, только проверяемые ссылки.",
    locale: "ru_RU",
  },
  en: {
    title: "Aleksandr Shulgin - AI & backend engineer",
    desc: "AI and backend engineer: bots, automation, AI agents, trading systems. 7 PRs merged into Google DeepMind, 8 systems running unattended.",
    ogt: "Aleksandr Shulgin - Code for any task",
    ogd: "Bots, automation, AI agents, trading systems. 7 PRs merged into Google DeepMind, 8 systems running unattended, verifiable links only.",
    locale: "en_US",
  },
} as const;
