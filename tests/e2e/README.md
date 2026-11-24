# End-to-end tests

Playwright + pytest against the live site (or a local build).

```
python3 -m pip install -r tests/e2e/requirements.txt && python3 -m playwright install chromium
python3 -m pytest tests/e2e -q
```

- `E2E_BASE=http://127.0.0.1:8799` runs against `dist/` served locally (`python3 -m http.server 8799 -d dist`).
- Pages open with `?nohit=1`, so the visit counter skips the run.
- The order form is tested against a mocked Worker; `E2E_LIVE_SEND=1` adds one real request (it lands in the owner's Telegram).
- `test_worker.py` checks the live Worker contract with requests that never reach Telegram.
