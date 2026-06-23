import type { Bi } from "../data/types";
import type { Lang } from "../i18n/dict";

/* Resolve a value that may be a plain string or a bilingual {ru,en}. */
export function biVal(v: Bi | string, lang: Lang): string {
  return typeof v === "string" ? v : v[lang];
}
