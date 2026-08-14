import type { Bi } from "./types";

export type Film = {
  id: string;          // = имя файла в public/films (mp4 + jpg-постер)
  title: Bi;
  kind: Bi;            // продукт / услуга / инструмент / клиентская работа
  lang: "ru" | "en";   // язык самого ролика, подписывается на карточке
  seconds: number;
  desc: Bi;
  style: Bi;           // визуальный язык — он у каждого ролика свой
};

/* Ролики собраны нашим движком Kadr: HTML, CSS и остановленный таймлайн GSAP
   рендерятся покадрово в MP4. Пять языков кадра намеренно разные: набор, снятый
   одним приёмом в разных цветах, читается как шаблон. */
export const films: Film[] = [
  {
    id: "web-turnkey",
    title: { ru: "Сайт под ключ", en: "A website, end to end" },
    kind: { ru: "услуга", en: "service" },
    lang: "ru",
    seconds: 13,
    desc: {
      ru: "Три работы, устройство заказа и то, что остаётся у заказчика. Тип каждой работы подписан прямо в кадре: две первые сделаны как образцы, третий сайт работает у клиента.",
      en: "Three pieces of work, how an order runs, and what the client keeps. Each piece is labelled on screen: the first two are our own reference builds, the third one runs for a real client.",
    },
    style: { ru: "светлый пружинный монтаж", en: "bright springy montage" },
  },
  {
    id: "serzhantovo",
    title: { ru: "Конный двор «Сержантово»", en: "Serzhantovo Horse Yard" },
    kind: { ru: "клиентская работа", en: "client work" },
    lang: "ru",
    seconds: 17,
    desc: {
      ru: "Фильм о месте и о сайте, который для него сделан. Фотографии заказчика, часы работы и формулировки сверены со страницей, включая правила контакта с лошадьми.",
      en: "A film about the place and the site built for it. The client's own photographs; opening hours and wording checked against the live page, including the rules for approaching the horses.",
    },
    style: { ru: "издательский разворот", en: "editorial spread" },
  },
  {
    id: "vpn25",
    title: { ru: "VPN 25", en: "VPN 25" },
    kind: { ru: "продукт", en: "product" },
    lang: "ru",
    seconds: 16,
    desc: {
      ru: "Продуктовый фильм: чёрное поле, в кадре всегда ровно один объект, экраны сняты с живого сайта. Цены и формулировки взяты со страницы сервиса дословно.",
      en: "A product film: a black field, exactly one object in frame at a time, screens captured from the live site. Prices and wording taken verbatim from the service page.",
    },
    style: { ru: "чёрная пустота, один объект", en: "black void, one object" },
  },
  {
    id: "agi",
    title: { ru: "Agent Graph Inspector", en: "Agent Graph Inspector" },
    kind: { ru: "инструмент, открытый код", en: "tool, open source" },
    lang: "en",
    seconds: 15,
    desc: {
      ru: "Разбор одного настоящего прогона из 25 агентов: 392 секунды суммой длительностей против 85 по часам. Все числа с живого демо, ни одного придуманного.",
      en: "One real 25-agent run taken apart: 392 seconds if you add every agent up, 85 on the wall clock. Every number comes from the live demo.",
    },
    style: { ru: "светлый лист, герой в числах", en: "light sheet, numbers as hero" },
  },
  {
    id: "opensource",
    title: { ru: "Открытый код", en: "Open source" },
    kind: { ru: "репозитории", en: "repositories" },
    lang: "en",
    seconds: 13,
    desc: {
      ru: "Указатель по нашим публичным репозиториям: 32 своих, 33 звезды, 25 под MIT. Два публичных форка из счёта исключены, раскладка лицензий показана как есть.",
      en: "An index of the public repositories: 32 of our own, 33 stars, 25 under MIT. Two public forks are excluded from the count, and the licence split is shown as it is.",
    },
    style: { ru: "инженерный проспект", en: "engineering prospectus" },
  },
  {
    id: "qwerty",
    title: { ru: "Qwerty Switcher", en: "Qwerty Switcher" },
    kind: { ru: "продукт", en: "product" },
    lang: "ru",
    seconds: 18,
    desc: {
      ru: "Промо переключателя раскладки для macOS: боль, решение и характер программы за восемнадцать секунд.",
      en: "A promo for the macOS layout switcher: the pain, the fix and the character of the app in eighteen seconds.",
    },
    style: { ru: "брутализм", en: "brutalist" },
  },
  {
    id: "kadr",
    title: { ru: "Kadr", en: "Kadr" },
    kind: { ru: "движок, открытый код", en: "engine, open source" },
    lang: "en",
    seconds: 12,
    desc: {
      ru: "Ролик о самом движке, которым собраны все остальные: код композиции превращается в кадр этого же ролика.",
      en: "A clip about the engine that rendered every other one here: composition code turning into a frame of this very clip.",
    },
    style: { ru: "брутализм", en: "brutalist" },
  },
];
