"""Every link on every page leads somewhere real; every in-page anchor has its target."""
import re
from urllib.parse import urlparse
import pytest
from conftest import BASE, PAGES, url

# sites that refuse robots (999/403/429) although the link is fine for a person
BOT_WALLS = ("linkedin.com", "x.com", "twitter.com", "kwork.ru", "hh.ru", "upwork.com", "habr.com",
             "fl.ru", "profi.ru", "vk.com", "youtube.com", "youtu.be", "launchbuck.com", "instagram.com",
             "github.com")  # GitHub rate-limits a burst of page fetches with 429


@pytest.fixture(scope="module")
def links(browser):
    """{absolute url without hash: set(source pages)} plus [(page, '#id') anchors], read after JS ran."""
    found, anchors = {}, []
    if True:
        b = browser
        for path in PAGES:
            for width in (1440, 390):
                ctx = b.new_context(viewport={"width": width, "height": 900}, locale="en-US")
                pg = ctx.new_page()
                pg.goto(url(path), wait_until="networkidle", timeout=45000)
                # raw attribute (to spot '#id' and mailto) + the browser-resolved URL (respects <base> and ../)
                pairs = pg.evaluate("() => [...document.querySelectorAll('a[href]')].map(a => [a.getAttribute('href'), a.href])")
                ids = set(pg.evaluate("() => [...document.querySelectorAll('[id]')].map(e => e.id)"))
                for h, resolved in pairs:
                    h = h.strip()
                    if not h or h.startswith(("mailto:", "tel:", "javascript:", "tg:", "data:")):
                        continue
                    if h.startswith("#"):
                        if len(h) > 1:
                            anchors.append((path, h[1:], h[1:] in ids))
                        continue
                    absu = resolved.split("#")[0]
                    found.setdefault(absu, set()).add(path)
                ctx.close()
    return found, anchors


def test_in_page_anchors_have_targets(links):
    _, anchors = links
    missing = sorted({f"{p}#{a}" for p, a, ok in anchors if not ok})
    assert not missing, f"anchors with no target: {missing}"


def test_internal_links_resolve(links, browser):
    found, _ = links
    ctx = browser.new_context()
    bad = []
    for u, src in sorted(found.items()):
        if urlparse(u).netloc != urlparse(BASE).netloc:
            continue
        r = ctx.request.get(u + ("&" if "?" in u else "?") + "nohit=1", max_redirects=5, timeout=30000)
        if r.status >= 500:
            r = ctx.request.get(u, max_redirects=5, timeout=30000)  # GitHub Pages one-off 503
        if r.status != 200:
            bad.append(f"{r.status} {u} (on {sorted(src)[:2]})")
    ctx.close()
    assert not bad, "broken internal links:\n" + "\n".join(bad)


def test_external_links_resolve(links, browser):
    found, _ = links
    ctx = browser.new_context(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15")
    bad = []
    for u, src in sorted(found.items()):
        host = urlparse(u).netloc
        if host == urlparse(BASE).netloc or not host:
            continue
        st = None
        for attempt in range(2):  # one retry: third-party sites throw one-off 502s
            try:
                st = ctx.request.get(u, max_redirects=8, timeout=25000).status
            except Exception as e:  # DNS, TLS, refused connection, timeout
                st = f"ERR {type(e).__name__}: {str(e).splitlines()[0][:80]}"
            if isinstance(st, int) and st < 500:
                break
        if isinstance(st, int) and (st < 400 or (any(host.endswith(d) for d in BOT_WALLS) and st in (403, 429, 999))):
            continue
        bad.append(f"{st} {u} (on {sorted(src)[:2]})")
    ctx.close()
    assert not bad, "external links that fail:\n" + "\n".join(bad)
