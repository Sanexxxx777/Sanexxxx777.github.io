"""Every page: loads, no JS errors, right language, no sideways scroll, every image actually loads."""
import pytest
from conftest import PAGES, REDIRECTS, scroll_through

WIDTHS = [360, 390, 1440]


@pytest.mark.parametrize("path", list(PAGES))
@pytest.mark.parametrize("width", WIDTHS)
def test_page_healthy(open_page, path, width):
    w = open_page(path, width=width)
    pg = w.page
    assert w.status == 200, f"{path}: HTTP {w.status}"
    exp = PAGES[path]
    if exp != "auto":
        assert pg.evaluate("document.documentElement.lang") == exp
    assert pg.title().strip(), "empty <title>"
    scroll_through(pg)
    overflow = pg.evaluate("document.documentElement.scrollWidth - window.innerWidth")
    assert overflow <= 1, f"page is {overflow}px wider than the screen"
    # text that runs past the right edge (body{overflow-x:hidden} hides it as silent clipping);
    # skipped: anything inside a scroll/clip container on purpose (tab strips, marquee, code)
    wide = pg.evaluate("""() => {
      const out = [];
      for (const e of document.querySelectorAll('body *')) {
        if (e.children.length || !e.textContent.trim() || e.closest('[aria-hidden=true]')) continue;
        const r = e.getBoundingClientRect();
        if (!r.width || r.right <= innerWidth + 2) continue;
        let a = e.parentElement, clipped = false;
        while (a && a !== document.body) {
          const ox = getComputedStyle(a).overflowX;
          if (ox !== 'visible' || getComputedStyle(a).position === 'fixed') { clipped = true; break; }
          a = a.parentElement;
        }
        if (!clipped) out.push(e.tagName + ' «' + e.textContent.trim().slice(0, 40) + '» right=' + Math.round(r.right));
        if (out.length > 4) break;
      }
      return out; }""")
    assert not wide, f"text runs off the right edge: {wide}"
    broken = pg.evaluate("""() => [...document.images].filter(i => i.getAttribute('src') && i.complete && i.naturalWidth === 0)
        .map(i => i.currentSrc || i.src)""")
    assert not broken, f"images that failed to load: {broken[:5]}"
    assert not w.page_errors, f"JS exceptions: {w.page_errors[:3]}"
    assert not w.console_errors, f"console errors: {w.console_errors[:3]}"
    assert not w.bad_status, f"own resources with 4xx/5xx: {w.bad_status[:5]}"


@pytest.mark.parametrize("path", REDIRECTS)
def test_redirect_pages_land_somewhere(open_page, path):
    w = open_page(path, wait="load")
    w.page.wait_for_timeout(3500)
    assert w.status == 200
    final = w.page.url.split("?")[0]
    assert not final.endswith(path), f"{path} did not redirect (still at {final})"
    assert not w.page_errors


@pytest.mark.parametrize("path", [p for p, l in PAGES.items() if l == "auto"])
@pytest.mark.parametrize("locale,lang", [("ru-RU", "ru"), ("en-US", "en")])
def test_auto_language(open_page, path, locale, lang):
    pg = open_page(path, locale=locale).page
    pg.wait_for_timeout(500)
    assert pg.evaluate("document.documentElement.lang") == lang, f"{path} with a {locale} browser"


def test_404_page(open_page):
    w = open_page("/no-such-page-e2e/")
    assert w.status == 404


@pytest.mark.parametrize("path", ["/", "/ru/", "/hire/", "/proof/"])
def test_reduced_motion_renders(open_page, path):
    w = open_page(path, width=390, reduced=True)
    assert w.status == 200
    assert not w.page_errors
    h1 = w.page.locator("h1").first
    assert h1.is_visible()
