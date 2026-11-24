"""/hire/ «Send request»: every state a visitor can meet. The Worker is mocked unless E2E_LIVE_SEND=1."""
import json
import os
import pytest
from conftest import WORKER

TASK = "Нужен бот для записи клиентов в салон, с напоминаниями"


def form(open_page, width=390, lang="ru"):
    w = open_page(f"/hire/?lang={lang}", width=width)
    pg = w.page
    pg.locator("#brief").scroll_into_view_if_needed()
    return w, pg


def mock(pg, status=200, body=None, abort=False, sink=None):
    cors = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"}

    def handle(route):
        if route.request.method == "OPTIONS":  # CORS preflight
            return route.fulfill(status=204, headers=cors)
        if sink is not None:
            sink.append(json.loads(route.request.post_data or "{}"))
        if abort:
            return route.abort()
        route.fulfill(status=status, content_type="application/json",
                      headers=cors,
                      body=json.dumps(body if body is not None else {}))
    pg.route(WORKER, handle)


def status(pg):
    pg.wait_for_timeout(700)
    return pg.locator("#brief-status").inner_text()


def test_validation_messages(open_page):
    w, pg = form(open_page)
    sent = []
    mock(pg, sink=sent)
    pg.click("#brief-send")
    assert "одной фразой" in status(pg)
    pg.fill("#brief-text", TASK)
    pg.click("#brief-send")
    assert "@username" in status(pg)
    pg.fill("#brief-contact", "not a contact")
    pg.click("#brief-send")
    assert "@username" in status(pg)
    assert sent == [], "invalid input must not reach the server"


def test_success_receipt_and_payload(open_page):
    w, pg = form(open_page)
    sent = []
    mock(pg, 200, {"id": "A-2411-TEST1", "due": "2026-11-25T09:00:00.000Z"}, sink=sent)
    pg.fill("#brief-text", TASK)
    pg.fill("#brief-contact", "https://t.me/some_client")
    pg.click("#brief-send")
    s = status(pg)
    assert "A-2411-TEST1" in s and "@some_client" in s, s
    assert pg.input_value("#brief-contact") == "@some_client", "t.me link must turn into @username"
    p = sent[0]
    assert p["task"] == TASK and p["contact"] == "@some_client" and p["lang"] == "ru"
    assert p["website"] == "" and len(p["key"]) >= 8 and p["ref"].startswith("hire")
    # a second request after success gets a fresh idempotency key
    pg.click("#brief-send")
    status(pg)
    assert sent[1]["key"] != p["key"]


def test_retry_after_failure_keeps_the_key(open_page):
    """A retry of the same text must reuse the key, so the owner never gets the same request twice."""
    w, pg = form(open_page)
    sent = []
    mock(pg, 502, {"error": "not_delivered"}, sink=sent)
    pg.fill("#brief-text", TASK)
    pg.fill("#brief-contact", "@some_client")
    pg.click("#brief-send")
    assert "не дошла" in status(pg)
    pg.click("#brief-send")
    status(pg)
    assert sent[0]["key"] == sent[1]["key"]


@pytest.mark.parametrize("kind,code,expect", [
    ("rate", 429, "Подождите минуту"),
    ("invalid", 422, "Проверьте текст"),
    ("down", 502, "не дошла"),
    ("network", None, "Нет связи"),
])
def test_error_states_point_to_telegram(open_page, kind, code, expect):
    w, pg = form(open_page)
    mock(pg, code or 200, {"error": kind}, abort=code is None)
    pg.fill("#brief-text", TASK)
    pg.fill("#brief-contact", "client@example.com")
    pg.click("#brief-send")
    assert expect in status(pg)
    assert not pg.locator("#brief-send").is_disabled(), "button must come back after an error"
    tg = pg.locator("#brief-tg").get_attribute("href")
    assert "text=" in tg, "the Telegram fallback must carry the typed text"


def test_english_texts(open_page):
    w, pg = form(open_page, lang="en")
    mock(pg, 200, {"id": "A-2411-TEST2", "due": "2026-11-25T09:00:00.000Z"})
    pg.fill("#brief-text", "I need a booking bot for a salon")
    pg.fill("#brief-contact", "client@example.com")
    pg.click("#brief-send")
    assert "Request A-2411-TEST2 received" in status(pg)


def test_privacy_link_and_section(open_page):
    w, pg = form(open_page, width=1440)
    href = pg.locator("#brief .fine a").first.get_attribute("href")
    assert href == "/privacy/"
    pr = open_page("/privacy/").page
    t = pr.evaluate("document.body.textContent")
    assert "Заявка с сайта" in t and "трансграничная" in t
    assert "Requests sent from the site" in t


@pytest.mark.skipif(os.environ.get("E2E_LIVE_SEND") != "1", reason="writes to Sasha's Telegram; set E2E_LIVE_SEND=1")
def test_live_send(open_page):
    w, pg = form(open_page)
    pg.fill("#brief-text", "Автотест формы (E2E_LIVE_SEND): можно удалить.")
    pg.fill("#brief-contact", "@Aleksandr_NFA")
    pg.click("#brief-send")
    pg.wait_for_function("() => /A-\\d{4}-/.test(document.getElementById('brief-status').textContent)", timeout=20000)
