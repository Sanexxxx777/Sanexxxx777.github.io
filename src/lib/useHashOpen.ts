import { useEffect, type RefObject } from "react";

/* Opens a <details> and scrolls it into view when the URL hash matches its id,
   both on mount and on hashchange (deep-links from the live-systems map into
   Work/Websites rows). Shared by WorksList and Websites. */
export function useHashOpen(ref: RefObject<HTMLDetailsElement | null>, id: string) {
  useEffect(() => {
    const check = () => {
      if (window.location.hash === `#${id}` && ref.current) {
        ref.current.open = true;
        ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    check();
    window.addEventListener("hashchange", check);
    return () => window.removeEventListener("hashchange", check);
  }, [ref, id]);
}
