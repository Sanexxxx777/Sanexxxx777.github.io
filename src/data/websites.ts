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
};

/* Ссылки проверены 14.08.2026 — все отвечают 200 и отдают саму страницу,
   а не заглушку хостера. Битая ссылка в портфолио хуже отсутствующей:
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
    pending: { ru: "запускается", en: "launching" },
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
];
