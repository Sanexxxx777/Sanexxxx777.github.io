"""Contract of the order Worker (order-intake): who may call it and what it answers. Never reaches Telegram:
every request here is rejected before delivery or hits the honeypot."""
import json
import pytest
from conftest import WORKER

SITE = "https://shulgin.is-a.dev"


@pytest.fixture(scope="module")
def req(browser):
    ctx = browser.new_context()
    yield ctx.request
    ctx.close()


def post(req, body, origin=SITE, raw=None):
    h = {"Content-Type": "application/json"}
    if origin:
        h["Origin"] = origin
    return req.post(WORKER, headers=h, data=raw if raw is not None else json.dumps(body), timeout=20000)


def test_preflight_allows_only_the_site(req):
    r = req.fetch(WORKER, method="OPTIONS", headers={"Origin": SITE, "Access-Control-Request-Method": "POST",
                                                     "Access-Control-Request-Headers": "content-type"})
    assert r.status == 204 and r.headers.get("access-control-allow-origin") == SITE
    r = req.fetch(WORKER, method="OPTIONS", headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "POST"})
    assert r.status == 403


def test_foreign_or_missing_origin_rejected(req):
    good = {"task": "x" * 20, "contact": "@someone", "key": "abcdefgh12"}
    assert post(req, good, origin=None).status == 403
    assert post(req, good, origin="https://evil.example").status == 403


def test_wrong_method_and_path(req):
    assert req.get(WORKER, headers={"Origin": SITE}).status == 405
    assert req.get(WORKER.replace("/order", "/x"), headers={"Origin": SITE}).status == 404


def test_validation(req):
    r = post(req, {"task": "short", "contact": "nope", "key": "!"})
    assert r.status == 422
    assert set(r.json()["fields"]) == {"task", "contact", "key"}
    assert post(req, None, raw="{not json").status == 400
    assert post(req, {"task": "x" * 2001, "contact": "@someone", "key": "abcdefgh12"}).status == 422
    assert post(req, None, raw=json.dumps({"task": "y" * 20000, "contact": "@a", "key": "k"})).status == 413


def test_honeypot_looks_like_success_but_sends_nothing(req):
    r = post(req, {"task": "spam spam spam spam", "contact": "@someone", "key": "abcdefgh12", "website": "http://spam"})
    assert r.status == 200
    assert r.json()["id"].endswith("00000"), "honeypot answer must be the fake receipt"
