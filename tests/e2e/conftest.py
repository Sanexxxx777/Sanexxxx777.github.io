"""End-to-end tests for shulgin.is-a.dev (Playwright + pytest).

Run:   python3 -m pytest tests/e2e -q
Base:  E2E_BASE=https://shulgin.is-a.dev (default) or a local build: E2E_BASE=http://127.0.0.1:8799
       (serve `dist/` with `python3 -m http.server 8799 -d dist`; the order Worker only answers the live origin,
       so the worker-contract tests need the live base anyway).
Live order send (writes to Sasha's Telegram): E2E_LIVE_SEND=1 — off by default.
Every page is opened with ?nohit=1 so the visit counter skips the run.
"""
import os
import re
import pytest
from playwright.sync_api import sync_playwright

BASE = os.environ.get("E2E_BASE", "https://shulgin.is-a.dev").rstrip("/")
WORKER = "https://order-intake.site-check-worker.workers.dev/order"

# path -> <html lang> it must have; "auto" = the page follows the visitor's browser language (test_auto_language)
PAGES = {
    "/": "en", "/ru/": "ru",
    "/hire/": "auto", "/cv/": "auto", "/proof/": "en", "/ru/proof/": "ru", "/privacy/": "ru",
    "/check/": "ru", "/studio/": "auto", "/video/": "auto", "/curated-claude-code/": "en",
    "/cases/agent-graph-inspector/": "en", "/agent-graph-inspector/demo.html": "en",
    "/store/": "auto", "/store/en/": "en", "/store/qwerty/": "auto", "/store/en/qwerty/": "en",
    "/store/mascot/": "ru", "/store/prosto/": "auto", "/store/prosto/en/": "en",
    "/store/factory/": "ru", "/store/agents/": "ru",
}
# pages that immediately send the visitor elsewhere (Workers, closed lab)
REDIRECTS = ["/game/", "/flood/", "/burn/", "/lab/"]

# console noise that is not a site defect
IGNORED_CONSOLE = [
    re.compile(r"Failed to load resource: net::ERR_(BLOCKED_BY_CLIENT|ABORTED)"),
    re.compile(r"Failed to load resource: net::ERR_TIMED_OUT"),  # network hiccup on the test machine; failed own resources still fail via bad_status/broken images
    re.compile(r"/hit\b"),  # counter beacon (skipped by nohit, but a stray preflight may log)
]


def url(path: str, extra: str = "") -> str:
    sep = "&" if "?" in path else "?"
    return f"{BASE}{path}{sep}nohit=1{extra}"


@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        b = p.chromium.launch()
        yield b
        b.close()


class Watched:
    """A page plus everything that went wrong on it."""

    def __init__(self, page):
        self.page = page
        self.console_errors: list[str] = []
        self.page_errors: list[str] = []
        self.failed: list[str] = []
        self.bad_status: list[str] = []
        page.on("console", self._console)
        page.on("pageerror", lambda e: self.page_errors.append(str(e)[:300]))
        page.on("requestfailed", lambda r: self.failed.append(f"{r.url[:150]} {r.failure}"))
        page.on("response", self._response)

    def _console(self, m):
        if m.type != "error":
            return
        t = m.text
        if any(rx.search(t) for rx in IGNORED_CONSOLE):
            return
        self.console_errors.append(t[:300])

    def _response(self, r):
        u = r.url
        if r.status >= 400 and u.startswith(BASE) and "/hit" not in u:
            self.bad_status.append(f"{r.status} {u}")


@pytest.fixture
def open_page(browser):
    ctxs = []

    def _open(path, width=1440, height=900, locale="en-US", reduced=False, wait="networkidle", touch=False):
        ctx = browser.new_context(viewport={"width": width, "height": height}, locale=locale,
                                  reduced_motion="reduce" if reduced else "no-preference",
                                  has_touch=touch, is_mobile=touch)
        ctxs.append(ctx)
        pg = ctx.new_page()
        w = Watched(pg)
        target = url(path) if path.startswith("/") else path
        w.retried = False
        try:
            resp = pg.goto(target, wait_until=wait, timeout=45000)
        except Exception as e:  # a one-off network timeout on the test machine, not a site defect: retry once
            if "ERR_TIMED_OUT" not in str(e) and "Timeout" not in str(e):
                raise
            w.retried = True
            w.console_errors.clear()
            resp = pg.goto(target, wait_until=wait, timeout=60000)
        if resp and resp.status >= 500 and not w.retried:  # GitHub Pages answers a rare one-off 503: retry once, report it
            pg.wait_for_timeout(2000)
            resp = pg.goto(target, wait_until=wait, timeout=45000)
            w.retried = True
        w.status = resp.status if resp else None
        return w

    yield _open
    for c in ctxs:
        c.close()


def scroll_through(page, step=700, pause=120):
    """Scroll to the bottom in steps so lazy images and reveal animations fire, then back to top."""
    h = page.evaluate("document.documentElement.scrollHeight")
    y = 0
    while y < h:
        page.evaluate(f"window.scrollTo(0, {y})")
        page.wait_for_timeout(pause)
        y += step
        h = page.evaluate("document.documentElement.scrollHeight")
    page.wait_for_timeout(600)
