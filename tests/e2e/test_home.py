"""The main page does what a buyer and a recruiter need in the first screen."""
from urllib.parse import parse_qs, urlparse
import pytest
from conftest import scroll_through


@pytest.mark.parametrize("path,lang,name", [("/", "en", "Aleksandr Shulgin"), ("/ru/", "ru", "Александр Шульгин")])
@pytest.mark.parametrize("width", [390, 1440])
def test_first_screen(open_page, path, lang, name, width):
    pg = open_page(path, width=width, height=844 if width == 390 else 900).page
    hero = pg.locator("#intro")
    assert name in hero.inner_text()
    cta = pg.locator('[data-cta="hero-tg"]')
    assert cta.is_visible()
    box = cta.bounding_box()
    vh = pg.viewport_size["height"]
    assert box["y"] + box["height"] <= vh, "order button is below the first screen"
    href = cta.get_attribute("href")
    q = parse_qs(urlparse(href).query)
    assert href.startswith("https://t.me/Aleksandr_NFA") and q.get("text", [""])[0].strip(), "Telegram link without prefilled text"
    assert cta.get_attribute("target") == "_blank"
    # the delivered-site card: real screenshot loaded, owner's words, link to the live site
    card = pg.locator('[data-cta="hero-case-site"] img')
    card.scroll_into_view_if_needed()
    pg.wait_for_function("img => img.complete && img.naturalWidth > 0", arg=card.element_handle(), timeout=15000)
    assert pg.locator('[data-cta="hero-case-link"]').get_attribute("href") == "https://me4tut.ru/"
    tiles = pg.locator('[data-cta^="hero-proof-"]')
    assert tiles.count() == 2
    assert tiles.first.inner_text().strip().startswith("7")


def test_sections_order_and_numbers(open_page):
    pg = open_page("/").page
    ids = pg.evaluate("() => [...document.querySelectorAll('main > section[id]')].map(s => s.id)")
    assert ids.index("websites") < ids.index("works"), f"client sites must come before works: {ids}"
    marks = pg.evaluate("() => [...document.querySelectorAll('main > section[id]')].map(s => { const w = s.querySelector('[class*=watermark]'); return w && w.firstChild ? w.firstChild.textContent.trim() : null; })")
    nums = [int(m) for m in marks if m and m.isdigit()]
    assert nums == sorted(nums) and len(nums) == len(set(nums)), f"section numbers out of order: {nums}"


def test_secondary_button_scrolls_to_sites(open_page):
    pg = open_page("/", width=390).page
    pg.locator('[data-cta="hero-works"] button').click()
    pg.wait_for_timeout(1500)
    top = pg.evaluate("document.getElementById('websites').getBoundingClientRect().top")
    assert -50 < top < 200, f"«View work» did not scroll to the sites section (top={top})"


def test_retired_work_folded_and_opens(open_page):
    pg = open_page("/").page
    crime = pg.locator("#work-crime")
    assert crime.count() == 1
    assert not crime.is_visible(), "retired work should be folded by default"
    btn = pg.locator('[data-cta="works-more-closed"]')
    btn.scroll_into_view_if_needed()
    btn.click()
    pg.wait_for_timeout(500)
    assert crime.is_visible()


def test_deep_link_to_folded_work_opens_it(open_page):
    pg = open_page("/").page
    pg.goto(pg.url.split("#")[0] + "#work-crime", wait_until="networkidle")
    pg.reload(wait_until="networkidle")
    pg.wait_for_timeout(1500)
    assert pg.locator("#work-crime").is_visible()


def test_language_switch(open_page):
    pg = open_page("/").page
    pg.locator('[data-cta="lang-ru"]').first.click()
    pg.wait_for_url("**/ru/**", timeout=10000)
    assert pg.evaluate("document.documentElement.lang") == "ru"
    assert "Александр Шульгин" in pg.locator("#intro").inner_text()


def test_mobile_menu(open_page):
    pg = open_page("/", width=390).page
    burger = pg.locator('button[aria-controls="site-sheet"]')
    assert burger.is_visible()
    burger.click()
    sheet = pg.locator("#site-sheet")
    sheet.wait_for(state="visible")
    assert sheet.locator("a").count() >= 4
    pg.keyboard.press("Escape")
    sheet.wait_for(state="detached")


def test_nav_targets_exist(open_page):
    pg = open_page("/").page
    for cta in ("nav-works",):
        pg.locator(f'[data-cta="{cta}"]').first.click()
        pg.wait_for_timeout(1200)
        assert pg.evaluate("document.getElementById('works').getBoundingClientRect().top") < 300


def test_quotes_are_real_and_linked(open_page):
    pg = open_page("/ru/").page
    scroll_through(pg)
    q = pg.locator("#quotes")
    t = q.inner_text()
    assert "Сто из десяти" in t and "сайт прям крутой" in t
    hrefs = q.locator("a").evaluate_all("as => as.map(a => a.href)")
    assert any("horsesfarm.ru" in h for h in hrefs) and any("me4tut.ru" in h for h in hrefs)


def test_lcp_mobile(open_page):
    """Largest Contentful Paint on a phone-size screen, no throttling: a smoke number, not a lab score."""
    pg = open_page("/ru/", width=390).page
    lcp = pg.evaluate("""() => new Promise(res => { let v = 0;
        new PerformanceObserver(l => { for (const e of l.getEntries()) v = e.startTime; }).observe({type: 'largest-contentful-paint', buffered: true});
        setTimeout(() => res(v), 1500); })""")
    assert 0 < lcp < 2500, f"LCP {lcp:.0f} ms"
