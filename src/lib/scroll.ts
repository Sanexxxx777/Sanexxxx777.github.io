/* Smooth-scroll to a section id. Native scrollIntoView + `scroll-padding-top`
   on <html> (global.css) accounts for the fixed header — no smooth-scroll
   library needed. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: smoothBehavior(), block: "start" });
}

/* An explicit `behavior: "smooth"` ignores the CSS `scroll-behavior` reset, so the
   reduced-motion branch has to live in JS. Every programmatic scroll uses this. */
export function smoothBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}
