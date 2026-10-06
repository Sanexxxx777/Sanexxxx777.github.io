/* Home-page layout switch. Default = FULL structure (Sasha's pick 06.10.2026);
   `?layout=short` shows the short order (Experiments strip instead of Lab, Flood,
   Films, Method; 3 timeline entries) so both can still be compared.
   Read once at load: the page is a single view, the flag never changes at runtime. */
export const fullLayout = new URLSearchParams(location.search).get("layout") !== "short";

/* Section ids in render order, after the hero (§01). Drives the § numbers so they
   run 02, 03, ... without gaps in both layouts, and the header scrollspy. */
export const SECTION_ORDER: readonly string[] = fullLayout
  ? ["works", "websites", "lab", "flood", "films", "method", "releases", "contact"]
  : ["works", "websites", "releases", "contact", "experiments"];

export function sectionNum(id: string): string {
  const i = SECTION_ORDER.indexOf(id);
  return String(i < 0 ? 0 : i + 2).padStart(2, "0");
}

/* "§08 / Timeline" -> "§04 / Timeline": swap the number in a dict badge for the
   one this layout gives the section. Sections without an id keep their dict number
   (Work is §02 in both layouts). */
export function badgeFor(badge: string, id?: string): string {
  return id ? badge.replace(/\d{2}/, sectionNum(id)) : badge;
}
