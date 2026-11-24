"""What search engines, LinkedIn and Telegram previews see."""
import io
import re
import pytest
from PIL import Image
from conftest import BASE, PAGES


@pytest.fixture(scope="module")
def req(browser):
    ctx = browser.new_context()
    yield ctx.request
    ctx.close()


def get(req, u):
    r = req.get(u, max_redirects=5, timeout=30000)
    if r.status >= 500:
        r = req.get(u, max_redirects=5, timeout=30000)
    return r


@pytest.mark.parametrize("path", [p for p in PAGES if p not in ("/agent-graph-inspector/demo.html", "/privacy/")])
def test_head_meta_and_share_image(req, path):
    r = get(req, BASE + path)
    assert r.status == 200
    html = r.text()
    head = html[: html.find("</head>")]
    title = re.search(r"<title[^>]*>(.*?)</title>", head, re.S)
    assert title and title.group(1).strip(), "no <title>"
    assert re.search(r'<meta[^>]+name="description"[^>]+content="[^"]{20,}', head), "no meta description"
    og = (re.search(r'<meta[^>]+property="og:image"[^>]+content="([^"]+)"', head)
          or re.search(r'<meta[^>]+content="([^"]+)"[^>]+property="og:image"', head))
    assert og, "no og:image"
    img = get(req, og.group(1))
    assert img.status == 200, f"og:image {og.group(1)} -> {img.status}"
    im = Image.open(io.BytesIO(img.body()))
    assert im.size[0] >= 1200 and im.size[1] >= 600, f"og:image is {im.size}"
    assert len(img.body()) < 600_000, "og:image heavier than 600 KB (slow previews)"


def test_robots_sitemaps_llms(req):
    robots = get(req, BASE + "/robots.txt")
    assert robots.status == 200 and "Sitemap:" in robots.text()
    for sm in re.findall(r"Sitemap:\s*(\S+)", robots.text()):
        r = get(req, sm)
        assert r.status == 200, sm
        locs = re.findall(r"<loc>([^<]+)</loc>", r.text())
        assert locs, f"{sm} lists no pages"
        bad = [u for u in locs if get(req, u).status != 200]
        assert not bad, f"{sm} lists pages that do not open: {bad}"
    for f in ("/llms.txt", "/llms-full.txt"):
        r = get(req, BASE + f)
        assert r.status == 200 and len(r.text()) > 500, f


def test_home_languages_point_at_each_other(req):
    for path, other in (("/", "/ru/"), ("/ru/", "/")):
        html = get(req, BASE + path).text()
        assert 'hreflang="ru"' in html and 'hreflang="en"' in html, f"{path}: hreflang missing"
        assert re.search(r'<link[^>]+rel="canonical"[^>]+href="https://shulgin\.is-a\.dev' + re.escape(path) + '"', html), f"{path}: canonical"


def test_pr_count_is_the_same_everywhere(req):
    """The number of merged DeepMind PRs must not drift between pages and metadata."""
    texts = {p: get(req, BASE + p).text() for p in ("/", "/ru/", "/proof/", "/ru/proof/", "/cv/", "/hire/")}
    texts["llms.txt"] = get(req, BASE + "/llms.txt").text()
    counts = {}
    for p, t in texts.items():
        for m in re.finditer(r"(\d+)\s*(?:PRs? merged|PR приняты|пул-реквест\w* приняты|merged PRs)", t):
            counts.setdefault(m.group(1), set()).add(p)
    assert len(counts) == 1, f"different PR counts on the site: { {k: sorted(v) for k, v in counts.items()} }"
