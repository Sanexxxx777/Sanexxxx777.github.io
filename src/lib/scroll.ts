/* Smooth-scroll to a section id. Native scrollIntoView + `scroll-padding-top`
   on <html> (global.css) accounts for the fixed header — no smooth-scroll
   library needed. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}
