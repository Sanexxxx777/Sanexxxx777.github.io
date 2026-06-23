import type Lenis from "lenis";

let _lenis: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  _lenis = l;
}

/* Smooth-scroll to a section id; falls back to native when Lenis is off (reduced motion). */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (_lenis) _lenis.scrollTo(el, { offset: -64 });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
}
