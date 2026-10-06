import { useCallback, useEffect, useRef, useState } from "react";

export type CollapseGroup = { key: string; ids: string[] };

/* Long lists show the first `limit` rows of each group; the rest stay in the DOM
   with `hidden`, so deep links (#work-<id>, #site-<id>) and the tag chips keep
   working: a target past the limit expands its group first, then scrolls to the
   row once it is visible. `groups` must be memoized by the caller. */
export function useCollapse(groups: CollapseGroup[], limit: number, prefix: string) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const openRef = useRef(open);
  useEffect(() => { openRef.current = open; }, [open]);
  const pending = useRef<string | null>(null);

  const toggle = useCallback((key: string) => setOpen((o) => ({ ...o, [key]: !o[key] })), []);
  const expand = useCallback((key: string) => setOpen((o) => (o[key] ? o : { ...o, [key]: true })), []);

  /* Reveal the group that holds `elId` and scroll to it. A visible row is scrolled
     at once; a hidden one after the re-render (see the effect below). */
  const revealAndScroll = useCallback((key: string, elId: string) => {
    if (openRef.current[key]) {
      document.getElementById(elId)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    pending.current = elId;
    setOpen((o) => ({ ...o, [key]: true }));
  }, []);

  useEffect(() => {
    const check = () => {
      const h = window.location.hash;
      if (!h.startsWith(`#${prefix}`)) return;
      const id = h.slice(1 + prefix.length);
      const g = groups.find((x) => x.ids.indexOf(id) >= limit);
      /* rows inside the limit are handled by useHashOpen in the row itself */
      if (g && !openRef.current[g.key]) revealAndScroll(g.key, h.slice(1));
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, [groups, limit, prefix, revealAndScroll]);

  useEffect(() => {
    if (!pending.current) return;
    const el = document.getElementById(pending.current);
    /* on mount this effect runs in the same flush as the hash check, before the
       group re-renders open: the row is still hidden, so wait for the next pass */
    if (!el || el.closest("[hidden]")) return;
    pending.current = null;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [open]);

  const isOpen = (key: string) => !!open[key];
  return { isOpen, toggle, expand, revealAndScroll };
}
