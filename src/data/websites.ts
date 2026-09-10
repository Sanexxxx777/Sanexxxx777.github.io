import type { Bi } from "./types";

export type Website = {
  id: string;
  name: Bi;
  kind: Bi;          // клиентский / наш продукт / демо-витрина
  desc: Bi;
  tags: string[];
  year: string;
  href?: string;     // без ссылки = ещё не опубликован, карточка не кликабельна
  pending?: Bi;      // чем заменить ссылку, пока сайта нет в проде
  shot?: string;      // превью 1200×1500 в public/sites/, показывается в раскрытой строке
  quote?: Bi;         // дословная цитата из сообщения заказчика после сдачи
  quoteBy?: Bi;       // кто сказал
};

/* Ссылки проверены 14.08.2026 — все отвечают 200 и отдают саму страницу,
   а не заглушку хостера. tanyabunina.ru добавлен 05.09.2026: TLS в порядке, отдаёт свой <title>. Битая ссылка в портфолио хуже отсутствующей:
   перед каждым релизом прогонять проверку заново. */
export const websites: Website[] = [
  {
    id: "horsesfarm",
    name: { ru: "Конный двор — Сержантово", en: "Serzhantovo Horse Yard" },
    kind: { ru: "клиентский сайт", en: "client site" },
    desc: {
      ru: "Конюшня и контактная зооферма: страницы животных, услуги, события, галерея. Владелец правит содержимое сам — вход по одноразовому коду на почту, без паролей и панели хостинга; сохранение публикует JSON, который страница подхватывает без пересборки. Загруженные фотографии автоматически ужимаются и переводятся в WebP, каждое сохранение делает резервную копию.",
      en: "A horse yard and petting farm: animal pages, services, events, gallery. The owner edits content directly - a one-time email code instead of passwords or a hosting panel; a save publishes JSON that the page picks up without a rebuild. Uploaded photos are resized and converted to WebP automatically, and every save writes a backup.",
    },
    tags: ["Next.js", "PHP", "CMS", "SEO"],
    year: "2026",
    href: "https://horsesfarm.ru/",
    shot: "/sites/horsesfarm.webp",
    quote: {
      ru: "«Вы реально сделали мне огромную работу. Люди со стороны говорят: сайт прям крутой. Я на такие детали внимания не обращаю, а они замечают. Спасибо большое.»",
      en: "\"You really did a huge job for me. People say from the outside that the site is really cool. I do not notice such details myself, but they do. Thank you so much.\"",
    },
    quoteBy: { ru: "Алёна, владелица конного двора", en: "Alyona, owner of the horse yard" },
  },
  {
    id: "tanya-bunina",
    name: { ru: "Татьяна Бунина — расчистка копыт", en: "Tatyana Bunina - Hoof Trimming" },
    kind: { ru: "клиентский сайт", en: "client site" },
    desc: {
      ru: "Сайт авторского курса по физиологичной расчистке копыт: программа из пятнадцати уроков, тарифы, видео, запись. Собран с нуля, а не выгрузкой из конструктора — без чужих скриптов и трекеров. Содержимое правится тем же редактором, что и конюшня.",
      en: "A site for an author's course on physiological hoof trimming: a fifteen-lesson programme, tariffs, videos, sign-up. Built from scratch rather than exported from a site builder - no third-party scripts or trackers. Content is edited through the same editor as the horse yard.",
    },
    tags: ["HTML", "CMS", "SEO"],
    year: "2026",
    href: "https://tanyabunina.ru/",
    shot: "/sites/tanyabunina.webp",
  },
  {
    id: "mechta-tut",
    name: { ru: "Мечта Тут — антикафе", en: "Mechta Tut anticafe" },
    kind: { ru: "клиентский сайт", en: "client site" },
    desc: {
      ru: "Антикафе и клуб настольных игр в Санкт-Петербурге: залы под мероприятия с калькулятором аренды, свободное посещение по минутам, коллекция игр в 3D-карусели, заявка в Telegram без серверных форм. Цены и анонсы владелец правит через свою админку, страница подхватывает их без пересборки.",
      en: "An anticafe and board-game club in Saint Petersburg: event rooms with a rental calculator, pay-per-minute visits, a 3D carousel of the game collection, a Telegram request flow with no server-side forms. The owner edits prices and announcements in an admin panel; the page picks them up without a rebuild.",
    },
    tags: ["HTML", "CSS", "JS", "admin"],
    year: "2026",
    href: "https://me4tut.ru/",
    shot: "/sites/mechta.webp",
    quote: {
      ru: "«Вот теперь идеальный сайт, реально. Сто из десяти. Всё чётко, всё красиво. Буду презентовать везде: в Telegram, во ВКонтакте, на YouTube, закреплю во всех роликах. Спасибо, что взялся.»",
      en: "\"Now this is the perfect site, really. A hundred out of ten. Everything is clean, everything is beautiful. I will present it everywhere: Telegram, VK, YouTube, pinned in every video. Thank you for taking it on.\"",
    },
    quoteBy: { ru: "Василий, антикафе «Мечта Тут»", en: "Vasily, Mechta Tut anticafe" },
  },
  {
    id: "whiteway",
    name: { ru: "WhiteWay", en: "WhiteWay" },
    kind: { ru: "сопровождение", en: "support" },
    desc: {
      ru: "Сайт и продуктовый стек инвестиционно-консалтинговой компании, в которой работал: сопровождение, правки и деплой в период работы в команде. Показываю как опыт поддержки чужого кода в проде, а не как свой заказ.",
      en: "The site and product stack of an investment consulting company I worked for: support, changes and deployment while on the team. Shown as experience supporting someone else's code in production, not as my own commission.",
    },
    tags: ["support", "deploy", "web3"],
    year: "2025",
    shot: "/sites/whiteway.webp",
    pending: { ru: "сайт компании, сейчас недоступен", en: "company site, currently offline" },
  },
  {
    id: "vpn25",
    name: { ru: "VPN 25", en: "VPN 25" },
    kind: { ru: "наша работа", en: "our own build" },
    desc: {
      ru: "Сайт сервиса: подключение, личный кабинет, поддержка. Тёмная витрина с собственным рендер-движком в оформлении. Сервис снят с продажи, страница остаётся образцом работы.",
      en: "The service site: setup, an account area, support. A dark storefront with our own render engine in the visuals. The service is no longer sold; the page stays as a sample of the work.",
    },
    tags: ["Vite", "CSS", "WebGL"],
    year: "2026",
    pending: { ru: "сервис закрыт", en: "service retired" },
  },
  {
    id: "kratno",
    name: { ru: "Кратно", en: "Kratno" },
    kind: { ru: "демо-витрина", en: "demo storefront" },
    desc: {
      ru: "Консалтинговое бюро по маркетингу и коммерческому управлению: девять страниц, услуги, методология, кейсы. Показательная работа — что получает заказчик за сайт под ключ.",
      en: "A marketing and commercial-management consultancy: nine pages, services, methodology, cases. A reference piece showing what a client gets for a turnkey site.",
    },
    tags: ["HTML", "CSS", "9 pages"],
    year: "2026",
    href: "https://shulgin.is-a.dev/kratno-landing-demo/",
    shot: "/sites/kratno.webp",
  },
  {
    id: "signal-studio",
    name: { ru: "Сигнал", en: "Signal" },
    kind: { ru: "демо-витрина", en: "demo storefront" },
    desc: {
      ru: "Агентство перформанс-маркетинга: пять страниц с расчётом эффективности и структурой услуг.",
      en: "A performance-marketing agency: five pages with efficiency figures and a service structure.",
    },
    tags: ["HTML", "CSS", "5 pages"],
    year: "2026",
    href: "https://shulgin.is-a.dev/signal-studio-landing-demo/",
    shot: "/sites/signal.webp",
  },
  {
    id: "store",
    name: { ru: "Витрина товаров и услуг", en: "Products & Services Storefront" },
    kind: { ru: "наш продукт", en: "our product" },
    desc: {
      ru: "Собственная витрина: приложения, услуги, разбор кейсов, загрузки. Здесь же живёт образец аудита вайбкод-проектов.",
      en: "Our own storefront: apps, services, case write-ups, downloads. It also hosts the sample audit of vibe-coded projects.",
    },
    tags: ["HTML", "CSS", "GitHub Pages"],
    year: "2026",
    href: "https://shulgin.is-a.dev/store/",
  },
  {
    id: "factory",
    name: { ru: "Контент-завод под ключ", en: "Content Factory" },
    kind: { ru: "наша услуга", en: "our service" },
    desc: {
      ru: "Одна тема утром превращается в посты для пяти площадок вечером: обложки, аудит текста, расписание. Страница услуги с кадрами живого завода и промо-роликом, собранным нашим же движком.",
      en: "One topic in the morning becomes posts for five platforms by evening: covers, copy audit, scheduling. A service page with footage of the live factory and a promo rendered by our own engine.",
    },
    tags: ["Service", "Automation", "Video"],
    year: "2026",
    href: "https://shulgin.is-a.dev/store/factory/",
  },
  {
    id: "agents",
    name: { ru: "Контур для ИИ-агента", en: "Agent Harness" },
    kind: { ru: "наша услуга", en: "our service" },
    desc: {
      ru: "Правила проекта, память между сессиями, гейты на необратимые действия и проверяемая сдача работы для Claude Code и Cursor. Страница услуги с открытым кодом инструментов.",
      en: "Project rules, memory across sessions, gates on irreversible actions and verifiable handoff for Claude Code and Cursor. A service page backed by open-source tooling.",
    },
    tags: ["Service", "AI", "Tooling"],
    year: "2026",
    href: "https://shulgin.is-a.dev/store/agents/",
  },
];
