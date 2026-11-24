"""/proof/ content and basic accessibility on the key pages."""
import pytest

PRS = ["4245", "4244", "4364", "4361", "6509", "7744", "4379"]


@pytest.mark.parametrize("path,lang", [("/proof/", "en"), ("/ru/proof/", "ru")])
def test_proof_lists_every_merged_pr(open_page, path, lang):
    pg = open_page(path).page
    hrefs = pg.locator("a.item").evaluate_all("as => as.map(a => a.href)")
    for n in PRS:
        assert any(h.endswith(f"/pull/{n}") for h in hrefs), f"PR #{n} missing on {path}"
    other = pg.locator("[data-en]" if lang == "ru" else "[data-ru]").evaluate_all(
        "es => es.filter(e => e.offsetParent !== null).length")
    assert other == 0, f"{path} shows text of the other language"


@pytest.mark.parametrize("path", ["/", "/ru/", "/hire/", "/proof/", "/cv/", "/privacy/", "/cases/agent-graph-inspector/"])
def test_basic_accessibility(open_page, path):
    pg = open_page(path, width=390, touch=True).page
    res = pg.evaluate("""() => {
      // visible = laid out and not inside a closed <details> (Chromium keeps boxes for its hidden content)
      const vis = e => !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length)
                       && !(e.closest('details:not([open])') && !e.closest('summary'));
      const name = e => (e.getAttribute('aria-label') || e.innerText || e.getAttribute('title') || '').trim()
                        || [...e.querySelectorAll('img[alt]')].map(i => i.alt).join('').trim();
      return {
        h1: [...document.querySelectorAll('h1')].filter(vis).length,
        noAlt: [...document.images].filter(i => !i.hasAttribute('alt')).map(i => i.src).slice(0, 5),
        unnamedButtons: [...document.querySelectorAll('button')].filter(b => vis(b) && !name(b)).map(b => b.outerHTML.slice(0, 80)).slice(0, 5),
        unnamedLinks: [...document.querySelectorAll('a[href]')].filter(a => vis(a) && !name(a)).map(a => a.outerHTML.slice(0, 80)).slice(0, 5),
        unlabeled: [...document.querySelectorAll('input:not([type=hidden]):not(.hp), textarea, select')].filter(f => vis(f)
            && !(f.id && document.querySelector('label[for="' + f.id + '"]')) && !f.getAttribute('aria-label') && !f.closest('label')).map(f => f.id || f.name).slice(0, 5),
        // WCAG 2.5.8 on a phone: a finger landing 12px above/below/left/right of the centre still hits the control.
        // Probes elementFromPoint, so invisible ::after hit areas count, as they do for a real tap.
        smallTargets: (() => { const out = [];
          for (const e of document.querySelectorAll('a[href], button')) {
            if (!vis(e) || e.closest('p, li, dd, figcaption, blockquote')) continue;
            e.scrollIntoView({block: 'center', behavior: 'instant'});
            const r = e.getBoundingClientRect(); if (!r.width || (r.height >= 24 && r.width >= 24)) continue;
            const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
            const miss = [[0, -11.5], [0, 11.5], [-11.5, 0], [11.5, 0]].some(([dx, dy]) => {
              const h = document.elementFromPoint(cx + dx, cy + dy); return !(h && (h === e || e.contains(h))); });
            if (miss) out.push((e.innerText || e.getAttribute('aria-label') || '').trim().slice(0, 30) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
            if (out.length > 7) break; }
          return out; })(),
      };
    }""")
    # /privacy/ is one document in two languages stacked (RU, then EN): one <h1> per language
    assert res["h1"] == (2 if path == "/privacy/" else 1), f"{res['h1']} <h1> on the page"
    assert not res["noAlt"], f"images without alt: {res['noAlt']}"
    assert not res["unnamedButtons"], f"buttons without a name: {res['unnamedButtons']}"
    assert not res["unnamedLinks"], f"links without a name: {res['unnamedLinks']}"
    assert not res["unlabeled"], f"form fields without a label: {res['unlabeled']}"
    assert not res["smallTargets"], f"tap targets under 24px: {res['smallTargets']}"
